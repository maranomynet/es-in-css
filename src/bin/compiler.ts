#!/usr/bin/env node
import autoprefixer from 'autoprefixer';
import { Command } from 'commander';
import cssnano from 'cssnano';
import { existsSync } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import { sync as glob } from 'glob';
import path from 'path';
import postcss, { AcceptedPlugin } from 'postcss';
import nested from 'postcss-nested';
import scss from 'postcss-scss';

import { getExportedCSS } from './getExportedCSS';
import { makePrettifyCSS } from './prettifyCSS';
import { InOutMap, resolveOutputFiles } from './resolveOutputFiles';

const program = new Command('es-in-css');

program
  .arguments('<inputglob>')
  .option('-d, --outdir <path>', 'Output directory')
  .option(
    '-b, --outbase <path>',
    'Specific common parent directory for the input glob file list — auto-detected by default.'
  )
  .option(
    '-e, --ext <file-extension>',
    'Custom file extension for the output files. Defaults to `.css`'
  )
  .option(
    '-m, --minify',
    'Minify the CSS output. Uses cssnano with its "default" preset.'
  )
  .option(
    '-p, --prettify [configFilePath]',
    'Runs the result CSS through Prettier. Accepts optional `configFilePath`, but defaults to resolving `.prettierrc` of `--outdir` or the current directory. Ignored if mixed with `--minify`.'
  );

program.parse();

const inputGlob = program.args[0] as string;

const options = program.opts<{
  outdir?: string;
  outbase?: string;
  minify?: true;
  ext?: string;
  prettify?: true | string;
}>();

// ---------------------------------------------------------------------------

const postcssPlugins: Array<AcceptedPlugin> = [nested, autoprefixer];
if (options.minify) {
  postcssPlugins.push(cssnano({ preset: 'default' }));
}

const postPostss =
  !options.minify && !!options.prettify
    ? makePrettifyCSS(options.prettify, options.outdir)
    : (css: string) => css;

// ---------------------------------------------------------------------------

const makeFile = (outFile: string) => async (css: string) => {
  const targetDir = path.dirname(outFile);
  if (!existsSync(targetDir)) {
    await mkdir(targetDir, { recursive: true });
  }
  writeFile(outFile, css).catch((err) => {
    console.error(err);
  });
};

const processFile = (args: InOutMap) =>
  getExportedCSS(args.inFile)
    .then((css) =>
      postcss(postcssPlugins).process(css, {
        from: undefined,
        // Converts inline comments to comment blocks
        parser: scss,
      })
    )
    .then((result) => postPostss(result.css))
    .then(makeFile(args.outFile))
    .catch((e: unknown) => {
      const message = e instanceof Error ? e.message : String(e);
      throw new Error(`Processing ${args.inFile}\n  ` + message.replace(/\n/g, '\n  '));
    });

// ---------------------------------------------------------------------------

const inputFiles = inputGlob ? glob(inputGlob) : [];

if (!inputFiles.length) {
  console.info(`No files found matching '${inputGlob}'`);
  process.exit();
}

Promise.all(resolveOutputFiles(inputFiles, options).map(processFile)).catch(
  (e: unknown) => {
    const message = e instanceof Error ? e.message : String(e);
    console.warn('ERROR: ', message);
    process.exit(1);
  }
);
