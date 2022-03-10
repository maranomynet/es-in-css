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

// ---------------------------------------------------------------------------

const makeFile = async (css: string, filePath: string) => {
  const targetDir = path.dirname(filePath);
  if (!existsSync(targetDir)) {
    await mkdir(targetDir, { recursive: true });
  }
  writeFile(filePath, css).catch((err) => {
    console.error(err);
  });
};

const postcssPlugins: Array<AcceptedPlugin> = [nested, autoprefixer];
if (options.minify) {
  postcssPlugins.push(cssnano({ preset: 'default' }));
}

const processFile = (filePath: string, outPath: string) => {
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
};

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

const resolveOutputFiles = (filePaths: Array<string>) => {
  const commonPath = getCommonPath(filePaths);

  return filePaths.map((file) => {
    const extention = path.extname(file);
    file = file.slice(0, -extention.length);
    if (path.extname(file) !== '.css') {
      file = file + '.css';
    }

    const outPath =
      outbase && file.startsWith(outbase)
        ? file.substring(outbase.length)
        : file.substring(commonPath.length);
    return {
      file,
      outPath: outdir + outPath,
    };
  });
};

const inputGlob = program.args[0];
if (inputGlob) {
  const filePaths = glob(inputGlob);

  resolveOutputFiles(filePaths).forEach((file) => processFile(file.file, file.outPath));
}
