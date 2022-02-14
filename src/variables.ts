import { UnitValue } from './units';

export type VariableValue = string | number | UnitValue;

const DEFAULT_NAME_RE = /^[a-z0-9_-]+$/i;

let varNameRe = DEFAULT_NAME_RE;

export type VariableStyles<T extends string> = {
  readonly declarations: string;
  readonly vars: Record<T, VariablePrinter>;
  override<K extends T>(vars: Record<K, string>): string;
};

type VariablePrinter = {
  (defaultValue?: VariableValue): string;
  toString(): string;
  toJSON(): string;
};

// ---------------------------------------------------------------------------

const newVariablePrinter = (name: string) => {
  const value = `var(--${name})`;

  const printer: VariablePrinter = (defaultValue) =>
    defaultValue ? value.replace(/\)$/, `, ${defaultValue})`) : value;

  printer.toString = printer.toJSON = () => value;

  return printer;
};

const mapObject = <T extends string, V>(
  input: Record<T, unknown>,
  mapper: (item: T) => V
): Record<T, V> =>
  Object.fromEntries(
    (Object.keys(input) as Array<T>).map((name) => [name, mapper(name)])
  ) as Record<T, V>;

const makeDeclarations = (
  vars: Record<string, VariableValue>,
  allowed?: Record<string, unknown>
): string =>
  Object.keys(vars)
    .map((name) => {
      if (!name || !varNameRe.test(name)) {
        throw new Error(
          `Only CSS variable names matching ${varNameRe} are supported.\nDisallowed name: ${name}`
        );
      }
      if (allowed && !(name in allowed)) {
        return '';
      }
      const value = String(vars[name]).trim();
      return `--${name}: ${value};\n`;
    })
    .join('');

// ===========================================================================

export const variables = <T extends string>(
  input: Record<T, VariableValue>
): VariableStyles<T> => ({
  declarations: makeDeclarations(input),
  vars: mapObject(input, newVariablePrinter),
  override: (overrides) => makeDeclarations(overrides, input),
});

variables.setNameRe = (customVarNameRe?: RegExp) => {
  if (customVarNameRe && !/^\/\^.+\$\/[igm]*$/.test(String(customVarNameRe))) {
    throw new Error(
      'Custom variable name RegExp must check the whole name (i.e. start with a `^` and end with a `$`)'
    );
  }
  varNameRe = customVarNameRe || DEFAULT_NAME_RE;
};
