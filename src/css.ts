declare const _RawCssString__Brand: unique symbol;
/**
 * Raw, un-transpiled CSS code.
 * May be incomplete and/or include (SCSS-like) nested syntax
 */
export type RawCssString = string & { [_RawCssString__Brand]?: true };

declare const _RawCssValue__Brand: unique symbol;
/**
 * Raw, rendered (string-cast) CSS value.
 */
export type RawCssValue = string & { [_RawCssValue__Brand]?: true };

const filterFalsy = (val: unknown) => (val || val === 0 ? val : '');

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
        ? rawValue.map(filterFalsy).join(' ')
        : typeof rawValue === 'function'
        ? rawValue()
        : rawValue;

      return str + filterFalsy(value);
    })
    .join('');
};

// ---------------------------------------------------------------------------

declare const _RawMediaQuery__Brand: unique symbol;
/** ... */
export type RawMediaQuery = string & { [_RawMediaQuery__Brand]?: true };

export function media(query: RawMediaQuery): (cssContent: RawCssString) => RawCssString;
export function media(query: RawMediaQuery, cssContent: RawCssString): RawCssString;

export function media(query: RawMediaQuery, cssContent?: RawCssString) {
  const mediaWrapper = (cssContent: RawCssString) =>
    css`
      @at-root (without: media) {
        @media ${query} {
          ${cssContent}
        }
      }
    `;

  if (arguments.length === 1) {
    // Curry!
    return mediaWrapper;
  }

  return mediaWrapper(cssContent || '');
}
