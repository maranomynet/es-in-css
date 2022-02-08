export const css = function (
  strings: TemplateStringsArray,
  ...values: Array<unknown>
): string {
  const valCount = values.length;
  return strings
    .map((str, i) => {
      const val = i < valCount ? String(values[i]) : '';
      return str + val;
    })
    .join('');
};
