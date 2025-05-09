import { describe, expect, test } from 'bun:test';

import { css, CssString, cssVal, media, str } from './css.js';
import { em, ms, px } from './units.js';

/** Normalizes the CSS output and converts it to a string type for easier matching */
const Expect = (css: CssString) => expect(css.replace(/\s\s+/g, ' ').trim());

// ===========================================================================

describe('css``', () => {
  test('outputs css string', () => {
    Expect(css`
      body {
        color: red;
        border: ${'1px solid blue'};
        background: ${['white']};
        width: ${33.3333}%;
      }
    `).toBe(
      'body { color: red; border: 1px solid blue; background: white; width: 33.3333%; }'
    );

    Expect(css``).toBe(''); // CSS can be empty string
  });

  test('tolerates BS inputs', () => {
    Expect(
      css`
        color: red;
      `
    ).toBe('color: red;');
    Expect(
      /* prettier-ignore */
      css`bogus: foobarvalue; ;`
    ).toBe('bogus: foobarvalue; ;');
    Expect(
      css`
        body {
          &:hover {
            color: red;
          }
        }
      `
    ).toBe('body { &:hover { color: red; } }');
  });

  test('joins arrays with a space', () => {
    const arr1 = [0, 1, 2];
    const arr2 = ['red', 'blue'];
    Expect(css`
      body {
        ${arr1.map((n) => `foo-${n}: ${n};`)}
        colours: ${arr2};
      }
    `).toBe('body { foo-0: 0; foo-1: 1; foo-2: 2; colours: red blue; }');
    // does NOT deal with nested arrays
    Expect(
      css`
        ${[arr1, arr2]}
      `
    ).toBe('0,1,2 red,blue');
  });

  test('calls functions with no params', () => {
    const fn1 = () => 'color: red;';
    const fn2 = (param: unknown) => `param: ${param};`;
    const fn3 = function () {
      return `arg-length: ${arguments.length};`;
    };
    Expect(css`
      body {
        ${fn1}
        ${fn2}
        ${fn3}
      }
    `).toBe('body { color: red; param: undefined; arg-length: 0; }');
  });

  test('prefers `toString()` over ~`valueOf()` on objects', () => {
    Expect(css`
      body {
        w: ${px(100)};
        h: ${em(1.01)};
        s: ${ms(0)};
        foo: ${{
          toString: () => 'bar',
          valueOf: () => 'baz',
        }};
      }
    `).toBe('body { w: 100px; h: 1.01em; s: 0ms; foo: bar; }');
  });

  test('does NOT attempt to correct bad CSS or insert semi-colons', () => {
    const rule1 = `color: red`;
    const rule2 = `border: 0`;
    Expect(css`
      body {
        ${rule1}
        ${rule2}
      }
    `).toBe('body { color: red border: 0 }');
  });

  test('converts `false`, `null` and `undefined` to empty string for convenience', () => {
    Expect(
      css`
        ${false}
        ${null}
        ${undefined}
        ${parseInt('NaN')}
        ${0}
        ${[undefined, null, false, 0, parseInt('NaN')]}
        ${() => undefined}
        ${() => false}
        ${() => null}
        ${() => 0}
        ${() => parseInt('NaN')}
      `
    ).toBe('0 0 0');

    // does NOT deal with nested arrays
    Expect(
      css`
        ${[[undefined, null, false]]}
      `
    ).toBe(',,false');
  });
});

// ===========================================================================

describe('cssVal``', () => {
  test('is a simple alias of `css`', () => {
    expect(cssVal).toBe(css);
  });
});

// ===========================================================================

describe('media() helper', () => {
  const mediaQuery = 'print and (screen)';
  const cssRules = 'p { color: red; }';
  const expectedOutput =
    '@at-root (without: media) { @media print and (screen) { p { color: red; } } }';

  test('outputs @at-root wrapped @media block', () => {
    Expect(media(mediaQuery, cssRules)).toBe(expectedOutput);
  });

  test('returns a curried function when called with a single argument', () => {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    Expect(media(mediaQuery)(cssRules)).toBe(expectedOutput);
  });
});

// ===========================================================================

describe('str() helper', () => {
  test('quotes strings in a safe way', () => {
    expect(str('Warning "Bob"!')).toBe('"Warning \\"Bob\\"!"');
  });

  test('coerces non-string values to String', () => {
    // @ts-expect-error  (testing bad input)
    const input: string = 99;
    expect(str(input)).toBe('"99"');
  });
});

// ===========================================================================
