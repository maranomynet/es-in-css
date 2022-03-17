import { extname, relative } from 'path';

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

export type DestinationOpts = {
  outbase?: string;
  outdir?: string;
  ext?: string;
};

export const resolveOutputFiles = (
  inputFiles: Array<string>,
  options: DestinationOpts
) => {
  const outdir = options.outdir
    ? (relative('', options.outdir + '/') || '.') + '/'
    : undefined;
  const outbase = options.outbase
    ? (relative('', options.outbase) || '.') + '/'
    : undefined;

  const ext = options.ext ? '.' + options.ext.replace(/^\./, '') : '.css';

  let commonPath = getCommonPath(inputFiles);
  if (outbase) {
    if (commonPath.startsWith(outbase)) {
      commonPath = outbase;
    } else {
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
    if (extname(outFile) !== ext) {
      outFile = outFile + ext;
    }

    if (outdir == null) {
      return { inFile, outFile };
    }

    return {
      inFile,
      outFile: (outdir || '') + outFile.substring(commonPath.length),
    };
  });
};
