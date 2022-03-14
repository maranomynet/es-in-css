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
import { InOutMap, resolveOutputFiles } from './resolveOutputFiles';

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

// ---------------------------------------------------------------------------

const makeFile = async (css: string, outFile: string) => {
  const targetDir = path.dirname(outFile);
  if (!existsSync(targetDir)) {
    await mkdir(targetDir, { recursive: true });
  }
  writeFile(outFile, css).catch((err) => {
    console.error(err);
  });
};

const postcssPlugins: Array<AcceptedPlugin> = [nested, autoprefixer];
if (options.minify) {
  postcssPlugins.push(cssnano({ preset: 'default' }));
}

const processFile = (args: InOutMap) => {
  getExportedCSS(args.inFile).then((css) => {
    postcss(postcssPlugins)
      .process(css, {
        from: undefined,
        // Converts inline comments to comment blocks
        parser: scss,
      })
      .then((result) => {
        makeFile(result.css, args.outFile);
      });
  });
};

const inputGlob = program.args[0];
if (inputGlob) {
  const inputFiles = glob(inputGlob);

  resolveOutputFiles(inputFiles, options).forEach(processFile);
}
