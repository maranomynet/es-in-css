import { Unit } from './units';

export type VariableStyles<T extends string> = {
  readonly declarations: string;
  readonly vars: Record<T, string>;
};

export const variables = <T extends string>(
  input: Record<T, string | Unit<unknown>>
): VariableStyles<T> => {
  const ret = {
    declarations: '',
    vars: {} as Record<T, string>,
  };
  (Object.keys(input) as Array<T>).forEach((name) => {
    ret.declarations += `--${name}: ${input[name]};\n`;
    ret.vars[name] = `var(--${name})`;
  });
  return ret as VariableStyles<T>;
};
