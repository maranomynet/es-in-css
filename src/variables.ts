import { ColorValue } from './colors';
import { UnitValue } from './units';
import { resolveType } from './variables.resolveType';

export type VariableValue = string | number | UnitValue | ColorValue | VariablePrinter;

const IS_PRINTER = Symbol();

const DEFAULT_NAME_RE = /^[a-z0-9_-]+$/i;
const DEFAULT_NAME_MAPPER = (name: string) => name;

export type VariableStyles<T extends string> = {
  declarations: string;
  readonly vars: Record<T, VariablePrinter>;
  override<K extends T>(vars: Record<K, string>): string;
};

type VariablePrinter = {
  (defaultValue?: VariableValue): string;
  type: string;
  toString(): string;
  toJSON(): string;
  [IS_PRINTER]: true;
};

export type VariableOptions = {
  /**
   * Custom name validation RegExp, for if you want/need to allow names
   * more complex than the default setting allows.
   *
   * Default: `/^[a-z0-9_-]+$/i`
   */
  nameRe: RegExp;
  /**
   * Maps weird/wonky JavaScript property names to CSS-friendly
   * css custom property names.
   *
   * Default: `(name) => name`
   */
  toCSSName: (name: string) => string;
  /**
   * Use this option if you're using a custom color manipulation library.
   *
   * Runs **after** the default color-detection logic, so it
   * does not need to check for common CSS color string formats.
   *
   * Example: `(value) => value instance of MyColorClass`
   */
  isColor?: (value: unknown) => boolean;
  /**
   * Runs ahead of the default type-resolution to detect custom types.
   *
   * If a falsy type name is returned, the default type resolver runs
   * as normal.
   */
  resolveType?: (value: unknown) => string | undefined;
};

// ---------------------------------------------------------------------------

const makeVariablePrinter = (name: string, type: string) => {
  const varString = `var(--${name})`;

  const printer = ((defaultValue) =>
    defaultValue
      ? varString.replace(/\)$/, `, ${defaultValue})`)
      : varString) as VariablePrinter;
  printer[IS_PRINTER] = true;
  printer.toString = printer.toJSON = () => varString;
  printer.type = type;

  return printer;
};

const mapObject = <T extends string, V>(
  input: Record<T, unknown>,
  makeValue: (name: string, value: unknown) => V
): Record<T, V> =>
  Object.fromEntries(
    (Object.entries(input) as Array<[T, unknown]>).map(([name, value]) => [
      name,
      makeValue(name, value),
    ])
  ) as Record<T, V>;

const makeDeclarations = (
  vars: Record<string, VariableValue>,
  options: VariableOptions,
  allowed?: Record<string, unknown>
): string => {
  const { nameRe, toCSSName } = options;
  return Object.keys(vars)
    .map((name) => {
      if (!name || !nameRe.test(name)) {
        throw new Error(
          `Only CSS variable names matching ${nameRe} are supported.\nDisallowed name: ${name}`
        );
      }
      if (allowed && !(name in allowed)) {
        return '';
      }
      const valueStr = String(vars[name]).trim();
      return `--${toCSSName(name)}: ${valueStr};\n`;
    })
    .join('');
};
// ===========================================================================

export const variables = <T extends string>(
  input: Record<T, VariableValue>,
  options: Partial<VariableOptions> = {}
): VariableStyles<T> => {
  if (options.nameRe && !/^\/\^.+\$\/[igm]*$/.test(String(options.nameRe))) {
    throw new Error(
      'Custom variable name RegExp must check the whole name (i.e. start with a `^` and end with a `$`)'
    );
  }
  const {
    nameRe = DEFAULT_NAME_RE,
    toCSSName = DEFAULT_NAME_MAPPER,
    resolveType: getCustomType,
    isColor,
  } = options;
  const opts = { nameRe, toCSSName };
  return {
    declarations: makeDeclarations(input, opts),
    vars: mapObject(input, (name, value) => {
      let type = (getCustomType && getCustomType(value)) || resolveType(value);
      if (isColor && type !== 'color' && isColor(value)) {
        type = 'color';
      }
      return makeVariablePrinter(toCSSName(name), type);
    }),
    override: (overrides) => makeDeclarations(overrides, opts, input),
  };
};

variables.isVar = (value: unknown): value is VariablePrinter =>
  typeof value === 'function' && IS_PRINTER in value;
