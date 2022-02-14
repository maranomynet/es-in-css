const esbuild = require('esbuild');
const pkg = require('./package.json');
const glob = require('glob').sync;
const { writeFileSync } = require('fs');
const { dtsPlugin } = require('esbuild-plugin-d.ts');
const exec = require('child_process').execSync;

// ---------------------------------------------------------------------------

const makePackageJson = (outdir) => {
  const { dist_package_json } = pkg;

  delete pkg.scripts;
  delete pkg.engines;
  delete pkg.private;
  delete pkg.devDependencies;
  delete pkg.dist_package_json;

  Object.assign(pkg, dist_package_json);

  writeFileSync(outdir + 'package.json', JSON.stringify(pkg, null, '\t'));
};

// ===========================================================================

const opts = process.argv.slice(2).reduce(
  /* <Record<string,unknown>> */ (map, arg) => {
    const [key, value] = arg.replace(/^-+/, '').split('=');
    map[key] = value == null ? true : value;
    return map;
  },
  {}
);

// ---------------------------------------------------------------------------

const allDeps = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.devDependencies || {}),
];
const exit1 = (err) => {
  console.error(err);

  process.exit(1);
};

// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------

const testsDir = '__tests';

exec('rm -rf ' + testsDir + ' && mkdir ' + testsDir);
esbuild
  .build({
    entryPoints: glob('src/**/*.tests.ts'),
    // entrypPoints: glob('src/**/*.tests.ts', { ignore: '**/__*.tests.ts' }),
    outdir: testsDir,
    format: 'cjs',
    bundle: true,
    external: allDeps,
    watch: opts.dev,
  })
  .catch(exit1);

// ---------------------------------------------------------------------------

if (!opts.dev) {
  const outdir = 'dist/';

  exec('rm -rf ' + outdir + ' && mkdir ' + outdir);
  exec('cp README.md CHANGELOG.md ' + outdir);
  makePackageJson(outdir);

  const build = (format, extraCfg) =>
    esbuild.build({
      entryPoints: ['src/index.ts'],
      entryNames: `lib/[name].${format}`,
      platform: format === 'cjs' ? 'node' : 'neutral',
      outdir,
      bundle: true,
      external: allDeps,
      // define: {
      //   'process.env.DEV_FILE_SERVER': JSON.stringify(process.env.DEV_FILE_SERVER),
      // },
      ...extraCfg,
    });

  build('esm', { plugins: [dtsPlugin({ outDir: outdir + 'lib/' })] }).catch(exit1);
  build('cjs').catch(exit1);

  // TODO: Build cli tool as cjs
}
