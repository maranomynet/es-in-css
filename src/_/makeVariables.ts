import { ColorValue } from './colors.js';
import { RawCssString } from './css.js';
import { UnitValue } from './units.js';

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

const [, , foo] = [true, 23, 'hello'] as const;

type VarsMap<T extends string> = Record<T, VariablePrinter>;

export type VariableStyles<T extends string> = {
  /**
   * Holds a readonly `Record<T, VariablePrinter>` object where the
   * `VariablePrinter`s emit the CSS variable names wrapped in `var()`, ready to be
   * used as CSS values … with the option of passing a default/fallback value via
   * the `.or() method`.
   *
   * @see https://github.com/maranomynet/es-in-css#variablestylesvars
   */
  readonly vars: VarsMap<T>;

  /**
   * Lets you type-safely write values for **all** the defined CSS variables into a
   * CSS rule block. Property names not matching `T` are dropped/ignored.
   *
   * @see https://github.com/maranomynet/es-in-css#variablestylesdeclare
   */
  declare(vars: Record<T, VariableValue>): RawCssString;

  /**
   * Similar to the `.declare()` method, but can be used to re-declare (i.e.
   * override) only some of of the CSS variables `T`. Again, property names not
   * matching `T` are ignored/dropped.
   *
   * Furthermore, values of `null`, `undefined`, `false` are interpreted as
   * "missing", and the property is ignored/dropped.
   *
   * @see https://github.com/maranomynet/es-in-css#variablestylesoverride
   */
  override(vars: Partial<Record<T, VariableValue | false | null>>): RawCssString;
};

export type VariablePrinter = Readonly<{
  /** Prints the CSS varible string with a fallback/default value paramter. */
  or(defaultValue: VariableValue): RawCssVarString;
  cssName: string;
  toString(): string;
  toJSON(): string;
  /** @deprecated Typing hack to allow direct printing into styled-components CSS templates. This method is an alias of `.toString()` */
  getName(): string;
}> & {
  /*
    NOTE:
    For some reason this Symbol prop can't be inside the Readonly<{}> block
    as it causes *.d.ts (--declaration) generation errors in
    downstream consumers of the es-in-css library:
    "
      Exported variable 'buildVariables' has or is using name 'IS_PRINTER'
      from external module "${PROJECT_PATH}/node_modules/es-in-css/makeVariables"
      but cannot be named.
    "
  */
  [IS_PRINTER]: true;
};

export type VariableOptions = {
  /**
   * Custom name validation RegExp, for if you want/need to allow names
   * more complex than the default setting allows.
   *
   * Default: `/^[a-z0-9_-]+$/i`
   *
   * @see https://github.com/maranomynet/es-in-css#variableoptions
   */
  nameRe: RegExp;
  /**
   * Maps weird/wonky JavaScript property names to CSS-friendly
   * css custom property names.
   *
   * Default: `(name) => name`
   *
   * @see https://github.com/maranomynet/es-in-css#variableoptions
   */
  toCSSName: (name: string) => string;

  /**
   * Prefix that gets added to all CSS printed variable names.
   *
   * The namespace is neither validated nor transformed in any way, except that
   * spaces and other invalid characters are silently stripped away.
   *
   * @see https://github.com/maranomynet/es-in-css#variableoptions
   */
  namespace?: string;
};

// ---------------------------------------------------------------------------

const makeVariablePrinter = (name: string): VariablePrinter => {
  const cssName = `--${name}`;
  const varString = `var(${cssName})`;
  const toString = () => varString;

  return {
    cssName,
    or: (defaultValue?: VariableValue) =>
      defaultValue ? varString.replace(/\)$/, `, ${defaultValue})`) : varString,
    [IS_PRINTER]: true,
    toString,
    toJSON: toString,
    getName: toString,
  };
};

// ---------------------------------------------------------------------------

const makeDeclarations = (
  vars: Partial<Record<string, VariableValue | false | null>>,
  allowed: Record<string, VariablePrinter>
): string => {
  return Object.entries(vars)
    .map(([key, value]) => {
      const printer = allowed[key];
      if (!printer || value == null || value === false) {
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

/**
 * Helper to provide type-safety and code-completion when using CSS custom
 * properties (CSS variables) at scale.
 *
 * @see https://github.com/maranomynet/es-in-css#makevariables-helper
 */
export const makeVariables = <T extends string>(
  variableTokens: Array<T>,
  options: Partial<VariableOptions> = {}
): VariableStyles<T> => {
  assertValidNameRe(options.nameRe);

  const { nameRe, toCSSName = DEFAULT_NAME_MAPPER } = options;

  const namespace = (options.namespace || '').replace(/[\s{};@():[\]]/g, '');

  const vars = Object.fromEntries(
    variableTokens.map((name) => {
      assertValidName(name, nameRe);
      return [name, makeVariablePrinter(namespace + toCSSName(name))];
    })
  ) as VarsMap<T>;

  return {
    vars,
    declare: (declarations) => makeDeclarations(declarations, vars),
    override: (overrides) => makeDeclarations(overrides, vars),
  };
};

// ---------------------------------------------------------------------------

/**
 * A helper that checks if an input value is of type `VariablePrinter`.
 *
 * @see https://github.com/maranomynet/es-in-css#makevariablesisvar-helper
 */
makeVariables.isVar = (value: unknown): value is VariablePrinter =>
  typeof value === 'function' && IS_PRINTER in value;

// ---------------------------------------------------------------------------

/**
 * This helper combines the variable values and declaration methods from multiple
 * `VariableStyles` objects into a new, larger `VariableStyles` object.
 *
 * @see https://github.com/maranomynet/es-in-css#makevariablesjoin-composition-helper
 */
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
