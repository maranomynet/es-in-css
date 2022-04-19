import o from 'ospec';

import { css } from './css';

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
  });

  o('calls functions with no params', () => {
    const fn1 = () => 'color: red;';
    const fn2 = (param: unknown) => `param: ${param};`;
    O(css`
      body {
        ${fn1}
        ${fn2}
      }
    `).equals('body { color: red; param: undefined; }');
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
});
