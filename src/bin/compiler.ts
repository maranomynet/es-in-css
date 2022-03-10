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
const outdir = ((options.outdir || '.') + '/').replace(/\/\/$/, '/');
const outbase = options.outbase
  ? (options.outbase + '/').replace(/\/\/$/, '/')
  : undefined;

async function makeFile(css: string, filePath: string) {
  const extention = path.extname(filePath);
  let outFilePath = filePath.slice(0, -extention.length);
  if (path.extname(outFilePath) !== '.css') {
    outFilePath = outFilePath + '.css';
  }
  const outDirPath = path.dirname(outFilePath);
  if (!existsSync(outDirPath)) {
    await mkdir(outDirPath, { recursive: true });
  }
  writeFile(outFilePath, css).catch((err) => {
    console.error(err);
  });
}

const postcssPlugins: Array<AcceptedPlugin> = [nested, autoprefixer];
if (options.minify) {
  postcssPlugins.push(cssnano({ preset: 'default' }));
}

function processFile(filePath: string, outPath: string) {
  getExportedCSS(filePath).then((css) => {
    postcss(postcssPlugins)
      .process(css, {
        from: undefined,
        // Converts inline comments to comment blocks
        parser: scss,
      })
      .then((result) => {
        makeFile(result.css, outPath);
      });
  });
}

const getCommonPath = (files: Array<string>) => {
  if (files[0]) {
    const commonPath = files[0].split('/').slice(-1);
    files.slice(1).forEach((file) => {
      const path = file.split('/');
      let i = commonPath.length - 1;
      while (commonPath[i] !== path[i]) {
        commonPath.pop();
        i--;
      }
    });
    return commonPath;
  }
  return '';
};

const inputGlob = program.args[0];
if (inputGlob) {
  const filePaths = glob(inputGlob);
  const commonPath = getCommonPath(filePaths);
  const getOutPaths = filePaths.map((file) => {
    const outPath =
      outbase && file.startsWith(outbase)
        ? file.substring(outbase.length)
        : file.substring(commonPath.length);
    return {
      file,
      outPath: outdir + outPath,
    };
  });
  getOutPaths.forEach((file) => processFile(file.file, file.outPath));
}
