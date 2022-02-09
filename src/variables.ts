import { Unit } from './units';

const mapObject = <T extends string, V>(
  input: Record<T, unknown>,
  mapper: (item: T) => V
): Record<T, V> =>
  Object.fromEntries(
    (Object.keys(input) as Array<T>).map((name) => [name, mapper(name)])
  ) as Record<T, V>;

const makeDeclarations = (vars: Record<string, VariableValue>): string =>
  Object.keys(vars)
    .map((name) => `--${name}: ${vars[name]};\n`)
    .join('');

export type VariableValue = string | Unit;

export type VariableStyles<T extends string> = {
  readonly declarations: string;
  readonly vars: Record<T, string>;
  override<K extends T>(vars: Record<K, string>): string;
};

export const variables = <T extends string>(
  input: Record<T, VariableValue>
): VariableStyles<T> => ({
  declarations: makeDeclarations(input),
  vars: mapObject(input, (name) => `var(--${name})`),
  override: makeDeclarations,
});
