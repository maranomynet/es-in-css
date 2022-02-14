export const css = function (
  strings: TemplateStringsArray,
  ...values: Array<unknown>
): string {
  const valCount = values.length;
  return strings
    .map((str, i) => {
      if (i === valCount) {
        return str;
      }
      const rawValue = values[i];
      const value = Array.isArray(rawValue)
        ? rawValue.join(' ')
        : typeof rawValue === 'function'
        ? rawValue()
        : rawValue;

      return str + value;
    })
    .join('');
};
