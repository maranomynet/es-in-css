import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import { access, mkdir, unlink, writeFile } from 'fs/promises';
import { dirname } from 'path';
import postcss, { AcceptedPlugin } from 'postcss';
import nested from 'postcss-nested';
import scss from 'postcss-scss';

import { getExportedCSS } from './compiler/getExportedCSS.js';
import { makePrettifyCSS } from './compiler/prettifyCSS.js';
import { InOutMap, resolveOutputFiles } from './compiler/resolveOutputFiles.js';

const makeFile = (outFile: string, contents: string) => {
  const targetDir = dirname(outFile);
  return access(targetDir)
    .catch(() => mkdir(targetDir, { recursive: true }))
    .then(() => writeFile(outFile, contents));
};

type ProcessingOpts = {
  outdir?: string;
  minify?: boolean;
  prettify?: string | boolean;
};

const makeProcessCSS = (options: ProcessingOpts) => {
  const postcssPlugins: Array<AcceptedPlugin> = [nested, autoprefixer];
  if (options.minify) {
    postcssPlugins.push(cssnano({ preset: 'default' }));
  }

  const postPostss =
    !options.minify && !!options.prettify
      ? makePrettifyCSS(options.prettify, options.outdir)
      : (css: string) => css;

  return (css: string) =>
    postcss(postcssPlugins)
      .process(css, {
        from: undefined,
        // Converts inline comments to comment blocks
        parser: scss,
      })
      .then((result) => postPostss(result.css));
};

// ---------------------------------------------------------------------------

export type CompilerOptions = {
  outdir?: string;
  outbase?: string;
  minify?: boolean;
  prettify?: boolean | string;
  ext?: string | ((sourceFile: string) => string | undefined | false | null);
  redirect?: (outFile: string, inFile: string) => string | undefined | false | null;
  banner?: string;
  footer?: string;
  write?: boolean;
};

type Ret<Opts extends CompilerOptions> = Opts extends { write: false }
  ? InOutMap & { css: string }
  : InOutMap;

export const compileCSS = <Opts extends CompilerOptions>(
  sourceFiles: Array<string>,
  options: Opts = {} as Opts
): Promise<Array<Ret<Opts>>> => {
  const processCSS = makeProcessCSS(options);
  const banner = options.banner ? options.banner + '\n' : '';
  const footer = options.footer ? '\n' + options.footer + '\n' : '';

  return Promise.all(
    resolveOutputFiles(sourceFiles, options).map((args: InOutMap) =>
      getExportedCSS(args.inFile)
        .then(processCSS)
        .then(async (css) => {
          css = banner + css;
          if (footer) {
            css = css.replace(/\n$/, '') + footer;
          }

          if (options.write === false) {
            return Object.assign({ css }, args);
          }
          await makeFile(args.outFile, css);
          return Object.assign({}, args) as Ret<Opts>;
        })
        .catch((e: unknown) => {
          const message = e instanceof Error ? e.message : String(e);
          throw new Error(
            `Processing ${args.inFile}\n  ` + message.replace(/\n/g, '\n  ')
          );
        })
    )
  );
};

// ---------------------------------------------------------------------------

export const compileCSSFromJS = <Opts extends CompilerOptions>(
  scriptStrings: Array<{
    fileName: string;
    content: string;
  }>,
  options: Opts
) =>
  Promise.all(
    scriptStrings.map(async ({ fileName, content }) => {
      await makeFile(fileName, content);
      return fileName;
    })
  )
    .then((inputFiles) => compileCSS(inputFiles, options))
    .then((rets) => {
      rets.forEach((ret) => unlink(ret.inFile));
      return rets;
    });
