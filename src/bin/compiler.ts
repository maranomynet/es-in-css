#!/usr/bin/env node
import autoprefixer from 'autoprefixer';
import { Command } from 'commander';
import fs from 'fs';
import glob from 'glob';
import path from 'path';
// import postcss from 'postcss-comment/hookRequire';
import postcss from 'postcss';
import nested from 'postcss-nested';

const program = new Command('es-in-css');

program
  .arguments('<glob>')
  .option('--outdir <dir>', 'output directory')
  .option('--outbase <dir>', 'outbase directory');

program.parse();

const options = program.opts();

function makeFile(css: string, filePath: string) {
  const extention = path.extname(filePath);
  let outFilePath = filePath.slice(0, -extention.length);
  if (path.extname(outFilePath) !== '.css') {
    outFilePath = outFilePath + '.css';
  }
  fs.writeFile(outFilePath, css, (err: Error | null) => {
    if (err) {
      console.error(err);
    }
  });
}

/**
 * Imports default exported CSS from an input file.
 * Resolves esm—commonjs wrappers if neccessary.
 */
const getExportedCSS = (filePath: string) =>
  import(process.cwd() + '/' + filePath).then((exported: Record<string, unknown>) => {
    const defaultExport = exported.default;
    if (typeof defaultExport === 'string') {
      return defaultExport;
    }
    // Handle es6 modules converted to commonjs with exported.default.default
    if (defaultExport && typeof defaultExport === 'object') {
      const maybeCSS = (defaultExport as { default: unknown }).default;
      if (typeof maybeCSS === 'string') {
        return maybeCSS;
      }
    }
    throw new Error(`${filePath} has doesn't emit string as its default export`);
  });

function processFile(filePath: string) {
  getExportedCSS(filePath).then((css) => {
    postcss([nested, autoprefixer])
      .process(css, { from: undefined })
      .then((result: any) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        makeFile(result.css, filePath);
      });
  });
}

const inputGlob = program.args[0];
if (inputGlob !== undefined) {
  glob(inputGlob, function (err: Error | null, files: Array<string>) {
    files.forEach((file) => {
      processFile(file);
    });
  });
}
