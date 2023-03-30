import o from 'ospec';

import { compareKeys } from '../_/test-utils';
import * as libTokens from '../compiler';

const tokens: Record<keyof typeof libTokens, true> = {
  compileCSS: true,
  compileCSSFromJS: true,
  compileCSSString: true,
};

o.spec('es-in-css compiler entry point', () => {
  o('exports all the expected things', () => {
    compareKeys(libTokens, tokens);
  });
});

/* eslint-disable import/first */
/* eslint-disable @typescript-eslint/no-unused-vars, unused-imports/no-unused-imports-ts, simple-import-sort/imports */
import type { StringCompilerOptions, CompilerOptions } from '../compiler';
/* eslint-enable @typescript-eslint/no-unused-vars, unused-imports/no-unused-imports-ts, simple-import-sort/imports */

import { compileCSSString } from '../compiler';
import { amp } from '../index.js';

// ===========================================================================

// ===========================================================================

type Test = {
  test: string;
  input: string;
  expected: string;
  options?: StringCompilerOptions;
  trim?: boolean;
};

const testCompiler = ({ test, input, expected, options, trim }: Test) =>
  compileCSSString(input, options).then((actual) => {
    if (trim) {
      actual = actual.trim().replace(/\s\s+/g, ' ');
      expected = expected.trim().replace(/\s\s+/g, ' ');
    }
    o(actual).equals(expected)(test);
  });

o.spec('compileCSSString', () => {
  o('works', (done) => {
    Promise.all([
      testCompiler({
        test: 'Resolves nesting by default',
        input: '/*  comment */\n\nbody{p{color:red } i { color: blue; } }',
        expected: '/*  comment */\n\nbody p{color:red }\n\nbody i { color: blue; }',
      }),
      testCompiler({
        test: 'Nesting can be turned off ',
        options: { nested: false },
        input: '/*  comment */\n\nbody{p{color:red } i { color: blue; } }',
        expected: '/*  comment */\n\nbody{p{color:red } i { color: blue; } }',
      }),
      testCompiler({
        test: 'Converts double-slash comments',
        input: '//  comment\nbody{p{color:red } }',
        expected: '/*  comment*/\nbody p{color:red }',
      }),
      testCompiler({
        test: 'Minify option works',
        options: { minify: true },
        input:
          '/*! retained */\n\n\n//  comment\nbody{p{color:red }\n\ni { color: blue; }  }',
        expected: '/*! retained */body p{color:red}body i{color:blue}',
      }),
      testCompiler({
        test: 'Prettify option works',
        options: { prettify: true },
        input: '/* comment */\nbody{p{color:red }\n\ni { color: blue; }  }',
        expected:
          '/* comment */\nbody p {\n  color: red;\n}\nbody i {\n  color: blue;\n}\n',
      }),
      testCompiler({
        test: 'Minify option defeats prettify',
        options: { prettify: true, minify: true },
        input: '/* comment */\nbody{p{color:red }\n\ni { color: blue; }  }',
        expected: 'body p{color:red}body i{color:blue}',
      }),
      // NOTE: package.json has a browserslist field hard-coded to Chrome v100
      testCompiler({
        test: 'Autoprefixer runs',
        input: 'body{ mask-image: foobar; }',
        expected: 'body{ -webkit-mask-image: foobar; mask-image: foobar; }',
      }),
    ])
      .then(() => done())
      .catch(done);
  });
});

o.spec('amp() workarond for postcss-nesting bug', () => {
  o('works', (done) => {
    testCompiler({
      test: 'apersand block is removed from output',
      input: amp(`p {color:red;} div & {color:blue;}`),
      expected: 'p {color:red;} div {color:blue;}',
      trim: true,
    })
      .then(() => done())
      .catch(done);
  });

  // NOTE: When/if these tests fail (in a meaningful way) then `postcss-nesting`
  // has been fixed and the `amp()` workaround function can be removed.
  // All downstream projects will need to be updated to replace the workaround
  // with plain root-level `& {}` blocks.
  o('is still neccessary', (done) => {
    Promise.all([
      testCompiler({
        test: 'root level `&` appears in output',
        input: '& { p {color:red;} div & {color:blue;} }',
        expected: '& p {color:red;} div & {color:blue;}',
      }),
      testCompiler({
        test: 'root level `&` appears in output',
        input: '@media screen { & { p {color:red;} div & {color:blue;} } }',
        expected: '@media screen { & p {color:red;} div & {color:blue;} }',
      }),
    ])
      .then(() => done())
      .catch(done);
  });
});
