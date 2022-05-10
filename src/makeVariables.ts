import { ColorValue } from './colors';
import { RawCssString } from './css';
import { resolveType } from './makeVariables.resolveType';
import { UnitValue } from './units';

type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

declare const _RawCssVarString__Brand: unique symbol;
/** CSS `var(--custom-property, fallback)` string  */
export type RawCssVarString = string & { [_RawCssVarString__Brand]?: true };

export type VariableValue = string | number | UnitValue | ColorValue | VariablePrinter;

const IS_PRINTER = Symbol();

const DEFAULT_NAME_RE = /^[a-z0-9_-]+$/i;
const DEFAULT_NAME_MAPPER = (name: string) => name;

type VarsMap<T extends string> = Record<T, VariablePrinter>;

export type VariableStyles<T extends string> = {
  declarations: RawCssString;
  readonly vars: VarsMap<T>;
  override<K extends T>(vars: Record<K, VariableValue>): RawCssString;
};

export type VariablePrinter = {
  (defaultValue?: VariableValue): RawCssVarString;
} & Readonly<{
  cssName: string;
  type: string;
  toString(): string;
  toJSON(): string;
  [IS_PRINTER]: true;
}>;

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
  const cssName = `--${name}`;
  const varString = `var(${cssName})`;

  const printer = ((defaultValue?: VariableValue) =>
    defaultValue
      ? varString.replace(/\)$/, `, ${defaultValue})`)
      : varString) as unknown as Mutable<VariablePrinter>;
  printer[IS_PRINTER] = true;
  printer.toString = printer.toJSON = () => varString;
  printer.type = type;
  printer.cssName = cssName;

  return printer as VariablePrinter;
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

// ---------------------------------------------------------------------------

const makeDeclarations = (
  vars: Record<string, VariableValue>,
  allowed: Record<string, VariablePrinter>
): string => {
  return Object.entries(vars)
    .map(([key, value]) => {
      const printer = allowed[key];
      const valueStr = String(value).trim();
      return printer ? `${printer.cssName}: ${valueStr};\n` : '';
    })
    .join('');
};

// ===========================================================================

const assertValidNameRe = (nameRe?: RegExp) => {
  if (nameRe && !/^\/\^.+\$\/[igm]*$/.test(String(nameRe))) {
    throw new Error(
      'Custom variable name RegExp must check the whole name (i.e. start with a `^` and end with a `$`)'
    );
  }
};
const assertValidName = (name: string, nameRe = DEFAULT_NAME_RE) => {
  if (!name || !nameRe.test(name)) {
    throw new Error(
      `Only CSS variable names matching ${nameRe} are allowed.\nDisallowed name: ${name}`
    );
  }
};

export const makeVariables = <T extends string>(
  input: Record<T, VariableValue>,
  options: Partial<VariableOptions> = {}
): VariableStyles<T> => {
  assertValidNameRe(options.nameRe);

  const {
    nameRe = DEFAULT_NAME_RE,
    toCSSName = DEFAULT_NAME_MAPPER,
    resolveType: getCustomType,
    isColor,
  } = options;

  const vars: VarsMap<T> = mapObject(input, (name, value) => {
    assertValidName(name, nameRe);
    let type = (getCustomType && getCustomType(value)) || resolveType(value);
    if (isColor && type !== 'color' && isColor(value)) {
      type = 'color';
    }
    return makeVariablePrinter(toCSSName(name), type);
  });

  return {
    declarations: makeDeclarations(input, vars),
    vars,
    override: (overrides) => makeDeclarations(overrides, vars),
  };
};

// ---------------------------------------------------------------------------

makeVariables.isVar = (value: unknown): value is VariablePrinter =>
  typeof value === 'function' && IS_PRINTER in value;

// ---------------------------------------------------------------------------

makeVariables.join = <VArr extends Array<VariableStyles<string>>>(
  ...varDatas: VArr
): VariableStyles<
  VArr extends Array<infer V> ? (V extends VariableStyles<infer T> ? T : never) : never
> => {
  const vars = Object.assign({}, ...varDatas.map((d) => d.vars));
  return {
    declarations: varDatas.map((d) => d.declarations).join(''),
    vars,
    override: (overrides) => makeDeclarations(overrides, vars),
  };
};
