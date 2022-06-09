import { extname, relative } from 'path';

import { CompilerOptions } from '../compiler.js';

export type InOutMap = {
  inFile: string;
  outFile: string;
};

export const getCommonPath = (fileNames: Array<string>): string => {
  if (fileNames[0]) {
    let commonPath = fileNames[0].split('/').slice(0, -1);
    fileNames.slice(1).forEach((file) => {
      const path = file.split('/');
      let i = 0;
      while (i < commonPath.length && commonPath[i] === path[i]) {
        i++;
      }
      commonPath = commonPath.slice(0, i);
    });
    return commonPath.length ? commonPath.join('/') + '/' : '';
  }
  return '';
};

export type DestinationOpts = Pick<
  CompilerOptions,
  'outdir' | 'outbase' | 'ext' | 'redirect'
>;

export const resolveOutputFiles = (
  inputFiles: Array<string>,
  options: DestinationOpts,
  silent?: boolean
) => {
  inputFiles = inputFiles.map((file) => relative('', file));
  const outdir = options.outdir
    ? (relative('', options.outdir + '/') || '.') + '/'
    : undefined;
  const outbase = options.outbase
    ? (relative('', options.outbase) || '.') + '/'
    : undefined;

  let commonPath = getCommonPath(inputFiles);
  if (outbase) {
    if (commonPath.startsWith(outbase)) {
      commonPath = outbase;
    } else {
      !silent &&
        console.warn(
          'Ignoring `outbase` option beacuse it does not match ' +
            'the common path of the input files.'
        );
    }
  }

  return inputFiles.map((inFile): InOutMap => {
    let outFile = inFile;
    const extention = extname(outFile);
    if (extention) {
      outFile = outFile.slice(0, -extention.length);
    }
    const _ext = options.ext;
    const targetExt = _ext
      ? '.' + (typeof _ext === 'string' ? _ext : _ext(inFile) || 'css').replace(/^\./, '')
      : '.css';

    if (extname(outFile) !== targetExt) {
      outFile = outFile + targetExt;
    }

    if (outdir != null) {
      outFile = (outdir || '') + outFile.substring(commonPath.length);
    }

    if (options.redirect) {
      const newOut = options.redirect(outFile, inFile);
      if (newOut && newOut !== inFile) {
        outFile = newOut;
      }
    }

    return { inFile, outFile };
  });
};
