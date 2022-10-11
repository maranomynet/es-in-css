declare const _RawCssString__Brand: unique symbol;
/**
 * Raw, un-transpiled CSS code.
 * May be incomplete and/or include (SCSS-like) nested syntax
 *
 * Soft-branded as a raw CSS string, only to convey intent/expectation —
 * not to prevent other strings being passed.
 */
export type RawCssString = string & { [_RawCssString__Brand]?: true };

declare const _RawCssValue__Brand: unique symbol;
/**
 * Raw, rendered (string-cast) CSS value.
 *
 * Soft-branded as a raw CSS value, only to convey intent/expectation —
 * not to prevent other strings being passed.
 */
export type RawCssValue = string & { [_RawCssValue__Brand]?: true };

/** Converts `null`, `undefined`, `false` and `NaN` values to an empty string.
 * Leaves `0` untouched
 */
const notFalsy = (val: unknown) => (val || val === 0 ? val : '');

/**
 * Dumb(-ish) tagged template literal that returns a `string`. It primarily
 * guarantees nice syntax highlighting and code-completion in VSCode by using a
 * well-known name.
 *
 * It also provides a few convenience features
 *
 * @see https://github.com/maranomynet/es-in-css#css-templater
 */
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
        ? rawValue.map(notFalsy).join(' ')
        : typeof rawValue === 'function'
        ? (rawValue() as unknown)
        : rawValue;

      return str + String(notFalsy(value));
    })
    .join('');
};

// ---------------------------------------------------------------------------

/**
 * An alias for the ` css`` ` templater, for cases where you're writing a
 * standalone CSS value or other out-of-context CSS snippets, and you wish to
 * disable VSCode's syntax highlighting and error checking.
 *
 * @see https://github.com/maranomynet/es-in-css#cssval-templater
 */
export const cssVal = css;

// ---------------------------------------------------------------------------

declare const _RawMediaQuery__Brand: unique symbol;
/**
 * String, but soft-branded as a media query.
 * Only used to convey intent/expectation — not to prevent other strings being passed.
 */
export type RawMediaQuery = string & { [_RawMediaQuery__Brand]?: true };

export function media(query: RawMediaQuery): (cssContent: RawCssString) => RawCssString;
export function media(query: RawMediaQuery, cssContent: RawCssString): RawCssString;

/**
 * @deprecated  Use DIY `@at-root` wraps instead  (Will be removed in v0.6+)
 *
 * This helper that emits a top-level `@media` block — i.e. one that forecully
 * @at-root breaks out any all ancestor `@media` blocks.
 *
 * This mixin is really only useful as a defence mechanism inside CSS-emitting
 * functions (mixins) that will be used in unpredictable `@media` contexts.
 */
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

/**
 * Helper to convert a value to a quoted string.
 *
 * @see https://github.com/maranomynet/es-in-css#str-quoted-string-printer
 */
export const str = (string: string) => JSON.stringify('' + string);
