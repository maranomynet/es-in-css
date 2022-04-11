import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import { existsSync } from 'fs';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { dirname } from 'path';
import postcss, { AcceptedPlugin } from 'postcss';
import nested from 'postcss-nested';
import scss from 'postcss-scss';

import { getExportedCSS } from './compiler/getExportedCSS';
import { makePrettifyCSS } from './compiler/prettifyCSS';
import {
  DestinationOpts,
  InOutMap,
  resolveOutputFiles,
} from './compiler/resolveOutputFiles';

const makeFile = async (outFile: string, contents: string) => {
  const targetDir = dirname(outFile);
  if (!existsSync(targetDir)) {
    await mkdir(targetDir, { recursive: true });
  }
  return writeFile(outFile, contents);
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
  ext?: DestinationOpts['ext'];
  prettify?: boolean | string;
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

  return Promise.all(
    resolveOutputFiles(sourceFiles, options).map((args: InOutMap) =>
      getExportedCSS(args.inFile)
        .then(processCSS)
        .then(async (css) => {
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
    scriptStrings.map(({ fileName, content }) => {
      makeFile(fileName, content);
      return fileName;
    })
  )
    .then((inputFiles) => compileCSS(inputFiles, options))
    .then((rets) =>
      rets.map((ret) => {
        const { inFile, ...rest } = ret;
        unlink(inFile);
        return rest;
      })
    );
