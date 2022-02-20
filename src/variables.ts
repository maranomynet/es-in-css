import { ColorValue } from './colors';
import { UnitValue } from './units';
import { resolveType } from './variables.resolveType';

export type VariableValue = string | number | UnitValue | ColorValue;

const DEFAULT_NAME_RE = /^[a-z0-9_-]+$/i;
const DEFAULT_NAME_MAPPER = (name: string) => name;

export type VariableStyles<T extends string> = {
  readonly declarations: string;
  readonly vars: Record<T, VariablePrinter>;
  override<K extends T>(vars: Record<K, string>): string;
};

type VariablePrinter = {
  (defaultValue?: VariableValue): string;
  type: string;
  toString(): string;
  toJSON(): string;
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
};

// ---------------------------------------------------------------------------

const makeVariablePrinter = (name: string, type: string) => {
  const varString = `var(--${name})`;

  const printer: VariablePrinter = (defaultValue) =>
    defaultValue ? varString.replace(/\)$/, `, ${defaultValue})`) : varString;

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
  const opts = {
    nameRe: options.nameRe || DEFAULT_NAME_RE,
    toCSSName: options.toCSSName || DEFAULT_NAME_MAPPER,
  };
  return {
    declarations: makeDeclarations(input, opts),
    vars: mapObject(input, (name, value) =>
      makeVariablePrinter(toCSSName(name), resolveType(value))
    ),
    override: (overrides) => makeDeclarations(overrides, opts, input),
  };
};
