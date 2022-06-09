#!/usr/bin/env node
import { Command } from 'commander';
import { sync as glob } from 'glob';

import { compileCSS, CompilerOptions } from '../compiler.js';

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

const options = program.opts<Omit<CompilerOptions, 'write'>>();

// ---------------------------------------------------------------------------

const inputFiles = inputGlob ? glob(inputGlob) : [];

if (!inputFiles.length) {
  console.info(`No files found matching '${inputGlob}'`);
  process.exit();
}

compileCSS(inputFiles, options).catch((e: unknown) => {
  const message = e instanceof Error ? e.message : String(e);
  console.warn('ERROR: ', message);
  process.exit(1);
});
