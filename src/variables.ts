import { UnitValue } from './units';

export type VariableValue = string | number | UnitValue;

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
  nameRe: RegExp;
  toCSSName: (name: string) => string;
};

// ---------------------------------------------------------------------------

const resolveType = (value: unknown) =>
  typeof value === 'number'
    ? 'number'
    : value instanceof UnitValue
    ? 'unit:' + value.unit
    : 'unknown';

const newVariablePrinter = (name: string, value: unknown) => {
  const varString = `var(--${name})`;

  const printer: VariablePrinter = (defaultValue) =>
    defaultValue ? varString.replace(/\)$/, `, ${defaultValue})`) : varString;

  printer.toString = printer.toJSON = () => varString;
  printer.type = resolveType(value);

  return printer;
};

const mapObject = <T extends string, V>(
  input: Record<T, unknown>,
  makeValue: (name: string, value: unknown) => V,
  toCSSName: (name: string) => string
): Record<T, V> =>
  Object.fromEntries(
    (Object.entries(input) as Array<[T, unknown]>).map(([name, value]) => [
      name,
      makeValue(toCSSName(name), value),
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
    vars: mapObject(input, newVariablePrinter, opts.toCSSName),
    override: (overrides) => makeDeclarations(overrides, opts, input),
  };
};
