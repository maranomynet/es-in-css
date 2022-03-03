#!/usr/bin/env node
import autoprefixer from 'autoprefixer';
import { Command } from 'commander';
import cssnano from 'cssnano';
import { writeFile } from 'fs/promises';
import glob from 'glob';
import path from 'path';
import postcss, { AcceptedPlugin } from 'postcss';
import nested from 'postcss-nested';
import scss from 'postcss-scss';

const program = new Command('es-in-css');

program
  .arguments('<glob>')
  .option('--outdir <dir>', 'output directory')
  .option('--outbase <dir>', 'outbase directory')
  .option('--minify', 'minify the CSS output');

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
      const maybeCSS = (defaultExport as Record<string, unknown>).default;
      if (typeof maybeCSS === 'string') {
        return maybeCSS;
      }
    }
    throw new Error(`${filePath} has doesn't emit string as its default export`);
  });

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
if (inputGlob !== undefined) {
  glob(inputGlob, function (err, files) {
    files.forEach((file) => {
      processFile(file);
    });
  });
}
