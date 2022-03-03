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
  delete pkg.hxmstyle;
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
const outdir = 'dist/';
const baseOpts = {
  bundle: true,
  platform: 'node',
  format: 'cjs',
  external: allDeps,
  watch: opts.dev,
  // define: {
  //   'process.env.DEV_FILE_SERVER': JSON.stringify(process.env.DEV_FILE_SERVER),
  // },
};

// ---------------------------------------------------------------------------

exec('rm -rf ' + testsDir + ' && mkdir ' + testsDir);
exec('rm -rf ' + outdir + ' && mkdir ' + outdir);
exec('cp README.md CHANGELOG.md ' + outdir);
makePackageJson(outdir);

// ---------------------------------------------------------------------------
// Build Unit Tests

esbuild
  .build({
    ...baseOpts,
    entryPoints: glob('src/**/*.tests.ts'),
    outdir: testsDir,
  })
  .catch(exit1);

// ---------------------------------------------------------------------------
// Build Library

const buildLib = (format, extraCfg) =>
  esbuild.build({
    ...baseOpts,
    platform: format === 'esm' ? 'neutral' : 'node',
    format,
    entryPoints: ['src/index.ts'],
    entryNames: `lib/[name].${format}`,
    outdir,
    ...extraCfg,
  });

buildLib('esm', { plugins: [dtsPlugin({ outDir: outdir + 'lib/' })] }).catch(exit1);
buildLib('cjs').catch(exit1);

// ---------------------------------------------------------------------------
// Build Compiler

esbuild.build({
  ...baseOpts,
  entryPoints: ['src/bin/compiler.ts'],
  outdir: outdir + 'bin/',
});
