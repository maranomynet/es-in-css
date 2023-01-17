import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import { access, mkdir, unlink, writeFile } from 'fs/promises';
import { dirname } from 'path';
import postcss, { AcceptedPlugin } from 'postcss';
import nestedPlugin, { Options as NestedPluginOptions } from 'postcss-nested';
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

type ProcessingOpts = Pick<CompilerOptions, 'minify' | 'prettify' | 'nested'> & {
  /**
   * Used as a base directory from which to auto-resolve prettier config.
   */
  outdir?: string;
};

const makeProcessCSS = (options: ProcessingOpts) => {
  const { nested = true, minify, prettify } = options;

  const postcssPlugins: Array<AcceptedPlugin> = [];

  if (nested) {
    const nestedOpts = nested !== true ? nested : {};
    postcssPlugins.push(nestedPlugin(nestedOpts));
  }

  postcssPlugins.push(autoprefixer);

  if (minify) {
    postcssPlugins.push(cssnano({ preset: 'default' }));
  }

  const postPostss =
    !minify && prettify
      ? makePrettifyCSS(prettify, options.outdir)
      : (css: string) => css;

  return (css: string) => {
    // NOTE: Functions/mixins commonly introduce stray ";" after curly-brace blocks.
    // Those semicolons then get parsed as weird/invalid selector tokens.
    css = css.replace(/\}(\s*;)+/g, '}');

    return postcss(postcssPlugins)
      .process(css, {
        from: undefined,
        // Converts inline comments to comment blocks
        parser: scss,
      })
      .then((result) => postPostss(result.css));
  };
};

// ---------------------------------------------------------------------------

export type CompilerOptions = {
  /**
   * By default the compiled CSS files are saved in the same folder as the source
   * file. This is rarely the desired behavior so by setting `outdir` you choose
   * where the compiled CSS files end up.
   *
   * The output file names replace the input-modules file-extension with `.css` —
   * unless if the source file name ends in `.css.js`, in which case the `.js`
   * ending is simply dropped.
   *
   * @see https://github.com/maranomynet/es-in-css#compilation-api
   */
  outdir?: string;

  /**
   * If your inputglob file list contains multiple entry points in separate
   * directories, the directory structure will be replicated into the `outdir`
   * starting from the lowest common ancestor directory among all input entry point
   * paths.
   *
   * @see https://github.com/maranomynet/es-in-css#compilation-api
   */
  outbase?: string;

  /**
   * Opts into moderately aggressive, yet safe [cssnano](https://cssnano.co/)
   * minification of the resulting CSS.
   *
   * All comments are stripped, except ones that start with `/*!`.
   *
   * @see https://github.com/maranomynet/es-in-css#compilation-api
   */
  minify?: boolean;

  /**
   * Runs the result CSS through Prettier. Accepts optional `configFilePath`, but
   * defaults to resolving `.prettierrc` for `--outdir` or the current directory.
   *
   * Ignored if mixed with `--minify`.
   *
   * Possible values:
   * - `false` or `undefined` — Do not prettify
   * - `true` — Prettify with config resolved based on `outdir`,
   *   or `cwd` as a fallback.
   * - `string`— Prettify with the config file at this path
   */
  prettify?: boolean | string;

  /**
   * (Default: `true`) Allows turning off the SCSS-like selector nesting behavior
   * provided by [postcss-nested](https://www.npmjs.com/package/postcss-nested)
   * or passing it custom options.
   *
   * @see https://github.com/maranomynet/es-in-css#compilation-api
   */
  nested?: boolean | NestedPluginOptions;

  /**
   * Customize the file-extension of the output files. Default is `.css`
   *
   * @see https://github.com/maranomynet/es-in-css#compilation-api
   */
  ext?: string | ((sourceFile: string) => string | undefined | false | null);

  /**
   * Dynamically changes the final destination of the output files.
   * (Values that lead to overwriting the source file are ignored.)
   *
   * @see https://github.com/maranomynet/es-in-css#compilation-api
   */
  redirect?: (outFile: string, inFile: string) => string | undefined | false | null;

  /**
   * Text that's prepended to every output file.
   *
   * @see https://github.com/maranomynet/es-in-css#compilation-api
   */
  banner?: string;

  /**
   * Text that's appended to every output file.
   *
   * @see https://github.com/maranomynet/es-in-css#compilation-api
   */
  footer?: string;

  /**
   * (Default: `true`) Allows turning off the automatic writing to disc,
   * if you want to post-process the files and handle the FS writes manually.
   *
   * When turned off the CSS content is returned as part of the promise payload.
   *
   * @see https://github.com/maranomynet/es-in-css#compilation-api
   */
  write?: boolean;
};

type Ret<Opts extends CompilerOptions> = Opts extends { write: false }
  ? InOutMap & { css: string }
  : InOutMap;

const bannerify = (
  css: string,
  options: Pick<CompilerOptions, 'banner' | 'footer'>
): string => {
  if (options.banner) {
    css = options.banner + '\n' + css;
  }
  if (options.footer) {
    css = css.replace(/\n$/, '') + '\n' + options.footer + '\n';
  }
  return css;
};

/**
 * Works in pretty much the same way as the CLI.
 *
 * Takes a list of files to read, and returns an Array of result objects each
 * containing the compiled CSS and the resolved output file path.
 *
 * @see https://github.com/maranomynet/es-in-css#compilecss-from-files
 */
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
          css = bannerify(css, options);
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

/**
 * Compiles CSS from a JavaScript source string. This may be the preferable
 * method when working with bundlers such as `esbuild`.
 *
 * @see https://github.com/maranomynet/es-in-css#compilecssfromjs
 */
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
    .then((inputFiles) =>
      compileCSS(inputFiles, options).catch((err) => {
        inputFiles.forEach(unlink);
        throw err;
      })
    )

    .then((rets) => {
      rets.map((ret) => ret.inFile).forEach(unlink);
      return rets;
    });

// ---------------------------------------------------------------------------

export type StringCompilerOptions = ProcessingOpts &
  Pick<CompilerOptions, 'banner' | 'footer'>;

/**
 * Lower-level method that accepts a raw, optionally nested, CSS string (or an
 * array of such strings) and returns a compiled CSS string (or array) —
 * optionally minified or prettified.
 *
 * @see https://github.com/maranomynet/es-in-css#compilecssstring
 */
export function compileCSSString(
  css: string,
  options?: StringCompilerOptions
): Promise<string>;
export function compileCSSString(
  css: Array<string>,
  options?: StringCompilerOptions
): Promise<Array<string>>;

export function compileCSSString(
  css: string | Array<string>,
  options: StringCompilerOptions = {}
) {
  const processCSS = makeProcessCSS(options);
  const compileString = (css: string) =>
    processCSS(css).then((css) => bannerify(css, options));

  if (typeof css === 'string') {
    return compileString(css);
  }
  return Promise.all(css.map(compileString));
}
