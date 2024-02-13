import { describe, expect, test } from 'bun:test';

import type { CompilerOptions, StringCompilerOptions } from './compiler.js';
import { compileCSSString } from './compiler.js';
import * as moduleExports from './compiler.js';

// ===========================================================================
// Test Type Signature and Exports

if (false as boolean) {
  /* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/naming-convention */

  // Make sure the module exports are as advertised
  const exports: Record<keyof typeof moduleExports, true> = {
    compileCSS: true,
    compileCSSFromJS: true,
    compileCSSString: true,
  };

  type StringCompilerOptions_is_exported = StringCompilerOptions;
  type CompilerOptions_is_exported = CompilerOptions;

  /* eslint-enable @typescript-eslint/no-unused-vars, @typescript-eslint/naming-convention */
}

// ===========================================================================
// Test Individual Functions

// Set timezone to something ahead of UTC to make sure tests don't depend on local time
process.env.TZ = 'Asia/Yangon';

describe('compileCSSString', () => {
  const tests: Array<{
    name: string;
    input: string;
    options?: StringCompilerOptions;
    expected: string;
  }> = [
    {
      name: 'Resolves nesting by default',
      input: '/*  comment */\n\nbody{p{color:red } i { color: blue; } }',
      expected: '/*  comment */\n\nbody p{color:red }\n\nbody i { color: blue; }',
    },
    {
      name: 'Nesting can be turned off ',
      options: { nested: false },
      input: '/*  comment */\n\nbody{p{color:red } i { color: blue; } }',
      expected: '/*  comment */\n\nbody{p{color:red } i { color: blue; } }',
    },
    {
      name: 'Converts double-slash comments',
      input: '//  comment\nbody{p{color:red } }',
      expected: '/*  comment*/\nbody p{color:red }',
    },
    {
      name: 'Minify option works',
      options: { minify: true },
      input:
        '/*! retained */\n\n\n//  comment\nbody{p{color:red }\n\ni { color: blue; }  }',
      expected: '/*! retained */body p{color:red}body i{color:blue}',
    },
    {
      name: 'Prettify option works',
      options: { prettify: true },
      input: '/* comment */\nbody{p{color:red }\n\ni { color: blue; }  }',
      expected:
        '/* comment */\nbody p {\n  color: red;\n}\nbody i {\n  color: blue;\n}\n',
    },
    {
      name: 'Minify option defeats prettify',
      options: { prettify: true, minify: true },
      input: '/* comment */\nbody{p{color:red }\n\ni { color: blue; }  }',
      expected: 'body p{color:red}body i{color:blue}',
    },
    // NOTE: package.json has a browserslist field hard-coded to Chrome v100
    {
      name: 'Autoprefixer runs',
      input: 'body{ mask-image: foobar; }',
      expected: 'body{ -webkit-mask-image: foobar; mask-image: foobar; }',
    },
  ];

  tests.forEach(({ name, input, options, expected }) =>
    test(name, () => {
      expect(compileCSSString(input, options)).resolves.toBe(expected);
    })
  );
});
