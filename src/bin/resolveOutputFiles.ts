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

export type DestinationOpts = { outbase?: string; outdir?: string };

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

  const commonPath = getCommonPath(inputFiles);

  return inputFiles.map((inFile): InOutMap => {
    let outFile = inFile;
    const extention = extname(outFile);
    if (extention) {
      outFile = outFile.slice(0, -extention.length);
    }
    if (extname(outFile) !== '.css') {
      outFile = outFile + '.css';
    }

    if (outdir == null) {
      return { inFile, outFile };
    }

    outFile =
      outbase && outFile.startsWith(outbase)
        ? outFile.substring(outbase.length)
        : outFile.substring(commonPath.length);

    return {
      inFile,
      outFile: (outdir || '') + outFile,
    };
  });
};