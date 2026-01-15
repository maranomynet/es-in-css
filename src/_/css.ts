declare const _CssString__Brand: unique symbol;
/**
 * Raw, un-transpiled CSS code.
 * May be incomplete and/or include (SCSS-like) nested syntax
 */
export type CssString = string & { [_CssString__Brand]: true };

/** Filters out all falsy values except `0`. */
const notFalsy = (val: unknown) => !!val || val === 0;

/**
 * Dumb(-ish) tagged template literal that returns a `string`. It primarily
 * guarantees nice syntax highlighting and code-completion in VSCode by using a
 * well-known name.
 *
 * It also provides a few convenience features.
 *
 * @see https://github.com/maranomynet/es-in-css/tree/v0.7#css-templater
 */
/*#__NO_SIDE_EFFECTS__*/
export const css = function (
  strings: TemplateStringsArray,
  ...values: Array<unknown>
): CssString {
  const valCount = values.length;
  return strings
    .map((str, i) => {
      if (i === valCount) {
        return str;
      }
      const rawValue = values[i];
      const value = Array.isArray(rawValue)
        ? rawValue.filter(notFalsy).join(' ')
        : typeof rawValue === 'function'
        ? (rawValue() as unknown)
        : rawValue;

      return str + String(notFalsy(value) ? value : '');
    })
    .join('') as CssString;
};

// ---------------------------------------------------------------------------

/**
 * An alias for the ` css`` ` templater function, for cases where you're writing a
 * standalone CSS value or other out-of-context CSS snippets, and you wish to
 * disable VSCode's syntax highlighting and error checking.
 *
 * @see https://github.com/maranomynet/es-in-css/tree/v0.7#cssval-templater
 */
/*#__NO_SIDE_EFFECTS__*/
export const cssVal = css;

// ---------------------------------------------------------------------------

declare const _CssediaQueryString__Brand: unique symbol;
/**
 * A CSS media-query string.
 *
 * (Example: `"screen and (max-width: 760px)""`
 */
export type CssMediaQueryString = string & { [_CssediaQueryString__Brand]: true };

/**
 * Helper to convert a value to a "quoted string".
 *
 * @see https://github.com/maranomynet/es-in-css/tree/v0.7#str-quoted-string-printer
 */
/*#__NO_SIDE_EFFECTS__*/
export const str = (string: string) => JSON.stringify(`${string}`);

// ===========================================================================
// Deprecated types:

declare const _RawCssString__Brand: unique symbol;
