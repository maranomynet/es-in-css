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
 * @deprecated  Use DIY `@at-root` wraps instead  (Will be removed in v0.6+)
 *
 * This helper that emits a top-level `@media` block — i.e. one that forecully
 * @at-root breaks out any all ancestor `@media` blocks.
 *
 * This mixin is really only useful as a defence mechanism inside CSS-emitting
 * functions (mixins) that will be used in unpredictable `@media` contexts.
 */
export function media(
  query: CssMediaQueryString | string
): (cssContent: CssString | string) => CssString;
export function media(
  query: CssMediaQueryString | string,
  cssContent: CssString | string
): CssString;

export function media(
  query: CssMediaQueryString | string,
  cssContent?: CssString | string
) {
  const mediaWrapper = (cssContent: CssString | string) =>
    css`
      ${'@at-root (without: media)'} {
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

/**
 * Helper to convert a value to a "quoted string".
 *
 * @see https://github.com/maranomynet/es-in-css/tree/v0.7#str-quoted-string-printer
 */
export const str = (string: string) => JSON.stringify(`${string}`);

// ===========================================================================
// Deprecated types:

declare const _RawCssString__Brand: unique symbol;
/** @deprecated  Use `CssString` type instead (Will be removed in v0.8) */
export type RawCssString = string & { [_RawCssString__Brand]?: true };
/** @deprecated  Use either `RawCssString` or just `string` instead (Will be removed in v0.8) */
export type RawCssValue = string & { [_RawCssString__Brand]?: true };
/** @deprecated  Use `CssMediaQueryString` type instead (Will be removed in v0.8) */
export type RawMediaQuery = string & { [_RawCssString__Brand]?: true };
