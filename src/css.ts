declare const _RawCssString__Brand: unique symbol;
/**
 * Raw, un-transpiled CSS code.
 * May be incomplete and/or include (SCSS-like) nested syntax
 */
export type RawCssString = string & { [_RawCssString__Brand]?: true };

export const css = function (
  strings: TemplateStringsArray,
  ...values: Array<unknown>
): RawCssString {
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
