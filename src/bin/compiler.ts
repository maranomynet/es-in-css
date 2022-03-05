#!/usr/bin/env node
import autoprefixer from 'autoprefixer';
import { Command } from 'commander';
import cssnano from 'cssnano';
import { writeFile } from 'fs/promises';
import { sync as glob } from 'glob';
import path from 'path';
import postcss, { AcceptedPlugin } from 'postcss';
import nested from 'postcss-nested';
import scss from 'postcss-scss';

import { getExportedCSS } from './getExportedCSS';

const program = new Command('es-in-css');

program
  .arguments('<inputglob>')
  .option('--outdir <dir>', 'Output directory')
  .option(
    '--outbase <dir>',
    'Specific common parent directory for the input glob file list — auto-detected by default.'
  )
  .option('--minify', 'Minify the CSS output. Uses cssnano with its "default" preset.');
// // Feature idea:
// .option(
//   '--prettify',
//   "Runs the result CSS through Prettier. Respects project's .prettierrc. Ignored if mixed with --minify."
// );

program.parse();

const options = program.opts();

function makeFile(css: string, filePath: string) {
  const extention = path.extname(filePath);
  let outFilePath = filePath.slice(0, -extention.length);
  if (path.extname(outFilePath) !== '.css') {
    outFilePath = outFilePath + '.css';
  }
  writeFile(outFilePath, css).catch((err) => {
    console.error(err);
  });
}

function processFile(filePath: string) {
  getExportedCSS(filePath).then((css) => {
    const plugins: Array<AcceptedPlugin> = [nested, autoprefixer];
    if (options.minify) {
      plugins.push(cssnano({ preset: 'default' }));
    }
    postcss(plugins)
      .process(css, {
        from: undefined,
        // Converts inline comments to comment blocks
        parser: scss,
      })
      .then((result) => {
        makeFile(result.css, filePath);
      });
  });
}

const inputGlob = program.args[0];
if (inputGlob) {
  glob(inputGlob).forEach(processFile);
}
