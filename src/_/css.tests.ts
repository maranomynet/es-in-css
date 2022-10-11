import o from 'ospec';

import { css, cssVal, media, str } from './css.js';
import { em, ms, px } from './units.js';

const O = (css: string) => o(css.replace(/\s\s+/g, ' ').trim());

o.spec('css``', () => {
  o('outputs css string', () => {
    O(css`
      body {
        color: red;
        border: ${'1px solid blue'};
        background: ${['white']};
        width: ${33.3333}%;
      }
    `).equals(
      'body { color: red; border: 1px solid blue; background: white; width: 33.3333%; }'
    );

    o(css``).equals('')('CSS can be empty string');
  });

  o('tolerates BS inputs', () => {
    O(
      css`
        color: red;
      `
    ).equals('color: red;');
    O(
      css`
        bogus: foobarvalue; ;
      `
    ).equals('bogus: foobarvalue; ;');
    O(
      css`
        body {
          &:hover {
            color: red;
          }
        }
      `
    ).equals('body { &:hover { color: red; } }');
  });

  o('joins arrays with a space', () => {
    const arr1 = [1, 2, 3];
    const arr2 = ['red', 'blue'];
    O(css`
      body {
        ${arr1.map((n) => `foo-${n}: ${n};`)}
        colours: ${arr2};
      }
    `).equals('body { foo-1: 1; foo-2: 2; foo-3: 3; colours: red blue; }');
    O(
      css`
        ${[arr1, arr2]}
      `
    ).equals('1,2,3 red,blue')('does NOT deal with nested arrays');
  });

  o('calls functions with no params', () => {
    const fn1 = () => 'color: red;';
    const fn2 = (param: unknown) => `param: ${param};`;
    const fn3 = function () {
      return `arg-length: ${arguments.length};`;
    };
    O(css`
      body {
        ${fn1}
        ${fn2}
        ${fn3}
      }
    `).equals('body { color: red; param: undefined; arg-length: 0; }');
  });

  o('prefers `toString()` over ~`valueOf()` on objects', () => {
    O(css`
      body {
        w: ${px(100)};
        h: ${em(1.01)};
        s: ${ms(0)};
        foo: ${{
          toString: () => 'bar',
          valueOf: () => 'baz',
        }};
      }
    `).equals('body { w: 100px; h: 1.01em; s: 0ms; foo: bar; }');
  });

  o('does NOT attempt to correct bad CSS or insert semi-colons', () => {
    const rule1 = `color: red`;
    const rule2 = `border: 0`;
    O(css`
      body {
        ${rule1}
        ${rule2}
      }
    `).equals('body { color: red border: 0 }');
  });

  o('converts `false`, `null` and `undefined` to empty string for convenience', () => {
    O(
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
    ).equals('0 0 0');

    O(
      css`
        ${[[undefined, null, false]]}
      `
    ).equals(',,false')('does NOT deal with nested arrays');
  });
});

o.spec('cssVal``', () => {
  o('is a simple alias of `css`', () => {
    o(cssVal).equals(css);
  });
});

o.spec('media() helper', () => {
  const mediaQuery = 'print and (screen)';
  const cssRules = 'p { color: red; }';
  const expectedOutput =
    '@at-root (without: media) { @media print and (screen) { p { color: red; } } }';

  o('outputs @at-root wrapped @media block', () => {
    O(media(mediaQuery, cssRules)).equals(expectedOutput);
  });

  o('returns a curried function when called with a single argument', () => {
    O(media(mediaQuery)(cssRules)).equals(expectedOutput);
  });
});

o.spec('str() helper', () => {
  o('quotes strings in a safe way', () => {
    o(str('Warning "Bob"!')).equals('"Warning \\"Bob\\"!"');
  });

  o('coerces non-string values to String', () => {
    // @ts-expect-error  (testing bad input)
    const input: string = 99;
    o(str(input)).equals('"99"');
  });
});
