const esbuild = require('esbuild');
const pkg = require('./package.json');
const glob = require('glob').sync;
const { writeFileSync } = require('fs');
const { dtsPlugin } = require('esbuild-plugin-d.ts');
const { writeFile, mkdir, access } = require('fs/promises');
const { dirname } = require('path');
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

const fileMem = {};
const newFile = ({ path }) => {
  if (path in fileMem) {
    return false;
  }
  fileMem[path] = true;
  return true;
};

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

const testsDir = '__tests/';
const outdir = '_npm_lib/';
const baseOpts = {
  bundle: true,
  platform: 'node',
  target: ['node16'],
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

const writeResults = (res) =>
  res.outputFiles.filter(newFile).forEach((res) => {
    const targetDir = dirname(res.path);
    return access(targetDir)
      .catch(() => mkdir(targetDir, { recursive: true }))
      .then(() => writeFile(res.path, res.text));
  });

esbuild
  .build({
    ...baseOpts,
    outdir: testsDir,
    entryPoints: glob('src/**/*.tests.ts'),
    entryNames: '[dir]/[name]--[hash]',
    write: false,
    watch: opts.dev && {
      onRebuild: (err, results) => {
        if (!err) {
          writeResults(results);
        }
      },
    },
  })
  .then(writeResults)
  .catch(exit1);

// ---------------------------------------------------------------------------
// Build Compiler Test CSS.js files

esbuild
  .build({
    ...baseOpts,
    entryPoints: glob('src/**/*.css.ts'),
    outdir: testsDir + 'css/styles/',
  })
  .catch(exit1);

// ---------------------------------------------------------------------------
// Build Library

const buildLib = (format, extraCfg) =>
  esbuild.build({
    ...baseOpts,
    platform: 'node',
    format,
    entryPoints: ['src/index.ts', 'src/compiler.ts'],
    outExtension: format === 'esm' ? { '.js': '.mjs' } : undefined,
    outdir,
    ...extraCfg,
  });

buildLib('esm', { plugins: [dtsPlugin({ outDir: outdir })] }).catch(exit1);
buildLib('cjs').catch(exit1);

// ---------------------------------------------------------------------------
// Build Compiler

esbuild.build({
  ...baseOpts,
  entryPoints: ['src/bin/cli.ts'],
  outbase: 'src',
  outdir,
});
