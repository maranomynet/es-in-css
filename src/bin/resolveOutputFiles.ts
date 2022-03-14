import { extname } from 'path';

export type InOutMap = {
  inFile: string;
  outFile: string;
};

export const getCommonPath = (fileNames: Array<string>) => {
  if (fileNames[0]) {
    const commonPath = fileNames[0].split('/').slice(-1);
    fileNames.slice(1).forEach((file) => {
      const path = file.split('/');
      let i = commonPath.length - 1;
      while (commonPath[i] !== path[i]) {
        commonPath.pop();
        i--;
      }
    });
    return commonPath;
  }
  return '';
};

export type DestinationOpts = { outbase?: string; outdir?: string };

export const resolveOutputFiles = (
  inputFiles: Array<string>,
  options: DestinationOpts
) => {
  const { outdir, outbase } = options;
  const commonPath = getCommonPath(inputFiles);

  return inputFiles.map((inFile): InOutMap => {
    let outFile =
      outbase && inFile.startsWith(outbase)
        ? inFile.substring(outbase.length)
        : inFile.substring(commonPath.length);

    const extention = extname(inFile);
    outFile = outFile.slice(0, -extention.length);
    if (extname(outFile) !== '.css') {
      outFile = outFile + '.css';
    }

    return {
      inFile,
      outFile: outdir + outFile,
    };
  });
};
