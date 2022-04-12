import o from 'ospec';

import {
  DestinationOpts,
  getCommonPath,
  InOutMap,
  resolveOutputFiles,
} from './resolveOutputFiles';

o.spec('getCommonPath', () => {
  const tests = [
    {
      input: ['__tests/css/styles/test.css.js', '__tests/css/styles/sub/test2.css.js'],
      expected: '__tests/css/styles/',
    },

    {
      input: ['some/path/foo.css.js', 'other/path/foo.css.js'],
      expected: '',
    },

    {
      input: ['__tests/css/styles/foo/test.css.js', '__tests/css/sub/foo/test2.css.js'],
      expected: '__tests/css/',
    },
  ];

  o('works', () => {
    tests.forEach(({ input, expected }) => {
      o(getCommonPath(input)).equals(expected);
    });
  });
});

o.spec('resolveOutputFiles', () => {
  type Test = {
    name: string;
    input: Array<string>;
    options: Array<DestinationOpts>;
    expected: Array<InOutMap>;
  };

  const tests: Array<Test> = [
    {
      name: 'works and resolves file-extensions correctly',
      input: [
        '__tests/css/styles/test.css.js',
        '__tests/css/styles/sub/test2.scss.js',
        '__tests/css/styles/sub/test3.js',
        '__tests/css/styles/sub/test4',
      ],
      options: [{}, { outdir: '' }],
      expected: [
        {
          inFile: '__tests/css/styles/test.css.js',
          outFile: '__tests/css/styles/test.css',
        },
        {
          inFile: '__tests/css/styles/sub/test2.scss.js',
          outFile: '__tests/css/styles/sub/test2.scss.css',
        },
        {
          inFile: '__tests/css/styles/sub/test3.js',
          outFile: '__tests/css/styles/sub/test3.css',
        },
        {
          inFile: '__tests/css/styles/sub/test4',
          outFile: '__tests/css/styles/sub/test4.css',
        },
      ],
    },

    {
      name: 'accepts custom file-extension',
      input: ['__tests/css/styles/test.css.js', '__tests/css/styles/sub/test2.scss.js'],
      options: [{ ext: 'scss' }, { ext: '.scss' }],
      expected: [
        {
          inFile: '__tests/css/styles/test.css.js',
          outFile: '__tests/css/styles/test.css.scss',
        },
        {
          inFile: '__tests/css/styles/sub/test2.scss.js',
          outFile: '__tests/css/styles/sub/test2.scss',
        },
      ],
    },

    {
      name: 'accepts dynamic file-extension based on inFile',
      input: ['__tests/css/styles/test.css.js', '__tests/css/styles/sub/test2.scss.js'],
      options: [
        { ext: (inFile) => (/\.scss\./.test(inFile) ? 'scss' : 'css') },
        { ext: (inFile) => /\.scss\./.test(inFile) && '.scss' },
      ],
      expected: [
        {
          inFile: '__tests/css/styles/test.css.js',
          outFile: '__tests/css/styles/test.css',
        },
        {
          inFile: '__tests/css/styles/sub/test2.scss.js',
          outFile: '__tests/css/styles/sub/test2.scss',
        },
      ],
    },

    {
      name: 'custom file-extensions can be weird',
      input: ['css/test.css.js', 'css/sub/test2.bar.js'],
      options: [{ ext: 'foo..bar' }],
      expected: [
        {
          inFile: 'css/test.css.js',
          outFile: 'css/test.css.foo..bar',
        },
        {
          inFile: 'css/sub/test2.bar.js',
          outFile: 'css/sub/test2.bar.foo..bar',
        },
      ],
    },

    {
      name: 'handles outdir correctly',
      input: ['test2/css/styles/test.css.js', 'test2/css/styles/sub/test2.css.js'],
      options: [
        { outdir: 'output' },
        { outdir: 'output/' },
        { outdir: './output/../output/' },
      ],
      expected: [
        {
          inFile: 'test2/css/styles/test.css.js',
          outFile: 'output/test.css',
        },
        {
          inFile: 'test2/css/styles/sub/test2.css.js',
          outFile: 'output/sub/test2.css',
        },
      ],
    },

    {
      name: 'resolves outdir pointing to cwd',
      input: ['test3/css/styles/test.css.js', 'test3/css/styles/sub/test2.css.js'],
      options: [{ outdir: './' }, { outdir: '.' }],
      expected: [
        {
          inFile: 'test3/css/styles/test.css.js',
          outFile: './test.css',
        },
        {
          inFile: 'test3/css/styles/sub/test2.css.js',
          outFile: './sub/test2.css',
        },
      ],
    },
    {
      name: 'Example 1 from README.md',
      input: [
        'src/css/styles.css.js',
        'src/css/resets.js',
        'src/css/component/buttons.css.js',
        'src/css/component/formFields.js',
      ],
      options: [{ outdir: 'dist/styles' }],
      expected: [
        {
          inFile: 'src/css/styles.css.js',
          outFile: 'dist/styles/styles.css',
        },
        {
          inFile: 'src/css/resets.js',
          outFile: 'dist/styles/resets.css',
        },
        {
          inFile: 'src/css/component/buttons.css.js',
          outFile: 'dist/styles/component/buttons.css',
        },
        {
          inFile: 'src/css/component/formFields.js',
          outFile: 'dist/styles/component/formFields.css',
        },
      ],
    },

    {
      name: 'Example 2 from README.md',
      input: [
        'src/css/styles.css.js',
        'src/css/resets.js',
        'src/css/component/buttons.css.js',
        'src/css/component/formFields.js',
      ],
      options: [{ outdir: 'dist/styles', outbase: './src' }],
      expected: [
        {
          inFile: 'src/css/styles.css.js',
          outFile: 'dist/styles/css/styles.css',
        },
        {
          inFile: 'src/css/resets.js',
          outFile: 'dist/styles/css/resets.css',
        },
        {
          inFile: 'src/css/component/buttons.css.js',
          outFile: 'dist/styles/css/component/buttons.css',
        },
        {
          inFile: 'src/css/component/formFields.js',
          outFile: 'dist/styles/css/component/formFields.css',
        },
      ],
    },

    {
      name: 'Ingores invalid/nonsensical outbase',
      input: ['src/skin/resets.js', 'src/skin/sub/styles.js'],
      options: [{ outbase: 'foo/bar', outdir: 'out' }],
      expected: [
        {
          inFile: 'src/skin/resets.js',
          outFile: 'out/resets.css',
        },
        {
          inFile: 'src/skin/sub/styles.js',
          outFile: 'out/sub/styles.css',
        },
      ],
    },

    {
      name: 'Handles outbase for absolute input filepaths',
      input: [
        process.cwd() + '/src/skin/resets.js',
        process.cwd() + '/src/skin/sub/styles.js',
      ],
      options: [{ outbase: 'src', outdir: 'out' }],
      expected: [
        {
          inFile: 'src/skin/resets.js',
          outFile: 'out/skin/resets.css',
        },
        {
          inFile: 'src/skin/sub/styles.js',
          outFile: 'out/skin/sub/styles.css',
        },
      ],
    },

    {
      name: 'Ignores partially invalid/nonsensical outbase',
      input: ['foo/bar/resets.js', 'foo/bar/sub/styles.js', 'src/styles/buttons.js'],
      options: [{ outbase: 'foo/bar' }],
      expected: [
        {
          inFile: 'foo/bar/resets.js',
          outFile: 'foo/bar/resets.css',
        },
        {
          inFile: 'foo/bar/sub/styles.js',
          outFile: 'foo/bar/sub/styles.css',
        },
        {
          inFile: 'src/styles/buttons.js',
          outFile: 'src/styles/buttons.css',
        },
      ],
    },

    {
      name: 'Allows dynamically redirecting output files',
      input: ['foo/bar/resets.js', 'foo/bar/sub/styles.css.js'],
      options: [{ redirect: (outFile) => outFile.toUpperCase() }],
      expected: [
        {
          inFile: 'foo/bar/resets.js',
          outFile: 'FOO/BAR/RESETS.CSS',
        },
        {
          inFile: 'foo/bar/sub/styles.css.js',
          outFile: 'FOO/BAR/SUB/STYLES.CSS',
        },
      ],
    },

    {
      name: 'Dynamic redirects happen after outfile has been fully esolved',
      input: ['foo/bar/resets.js', 'foo/bar/sub/styles.less.js'],
      options: [
        { outdir: 'dist', ext: 'less', redirect: (outFile) => outFile.toUpperCase() },
      ],
      expected: [
        {
          inFile: 'foo/bar/resets.js',
          outFile: 'DIST/RESETS.LESS',
        },
        {
          inFile: 'foo/bar/sub/styles.less.js',
          outFile: 'DIST/SUB/STYLES.LESS',
        },
      ],
    },
  ];

  tests.forEach(({ name, input, options, expected }, i) => {
    o(`${name} (opts #${i})`, () => {
      options.forEach((opts) => {
        o(resolveOutputFiles(input, opts, true)).deepEquals(expected);
      });
    });
  });
});
