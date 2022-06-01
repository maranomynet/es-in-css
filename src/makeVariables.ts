import { ColorValue } from './colors';
import { RawCssString } from './css';
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
  readonly vars: VarsMap<T>;
  declare(vars: Record<T, VariableValue>): RawCssString;
  override(vars: Partial<Record<T, VariableValue>>): RawCssString;
};

export type VariablePrinter = {
  (defaultValue?: VariableValue): RawCssVarString;
} & Readonly<{
  cssName: string;
  toString(): string;
  toJSON(): string;
  [IS_PRINTER]: true;

  /** @deprecated Typing hack to allow direct printing into styled-components CSS templates. This method is an alias of `.toString()` */
  getName(): string;
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
};

// ---------------------------------------------------------------------------

const makeVariablePrinter = (name: string) => {
  const cssName = `--${name}`;
  const varString = `var(${cssName})`;

  const printer = ((defaultValue?: VariableValue) =>
    defaultValue
      ? varString.replace(/\)$/, `, ${defaultValue})`)
      : varString) as unknown as Mutable<VariablePrinter>;
  printer[IS_PRINTER] = true;
  printer.toString = printer.toJSON = printer.getName = () => varString;
  printer.cssName = cssName;

  return printer as VariablePrinter;
};

// ---------------------------------------------------------------------------

const makeDeclarations = (
  vars: Partial<Record<string, VariableValue>>,
  allowed: Record<string, VariablePrinter>
): string => {
  return Object.entries(vars)
    .map(([key, value]) => {
      const printer = allowed[key];
      if (!printer || value == null) {
        return '';
      }
      return `${printer.cssName}: ${String(value).trim()};\n`;
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
  variableTokens: Array<T>,
  options: Partial<VariableOptions> = {}
): VariableStyles<T> => {
  assertValidNameRe(options.nameRe);

  const { nameRe, toCSSName = DEFAULT_NAME_MAPPER } = options;

  const vars = Object.fromEntries(
    variableTokens.map((name) => {
      assertValidName(name, nameRe);
      return [name, makeVariablePrinter(toCSSName(name))];
    })
  ) as VarsMap<T>;

  return {
    vars,
    declare: (declarations) => makeDeclarations(declarations, vars),
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
    vars,
    declare: (declarations) => makeDeclarations(declarations, vars),
    override: (overrides) => makeDeclarations(overrides, vars),
  };
};
