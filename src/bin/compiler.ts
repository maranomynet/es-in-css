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

function processFile(filePath: string) {
  import(filePath).then((importedFile: { default: string }) => {
    postcss([nested, autoprefixer])
      .process(importedFile.default, { from: undefined })
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
