import { relative } from 'path';

export const extractDefaultExport = (exported: unknown) => {
  if (exported == null) {
    return;
  }
  const defaultExport = (exported as Record<string, unknown>).default;
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
  return;
};

/**
 * Imports default exported CSS from an input file.
 * Resolves esm—commonjs wrappers if neccessary.
 */
export const getExportedCSS = (filePath: string) =>
  import(relative('', filePath)).then(extractDefaultExport).then((css) => {
    if (css == null) {
      throw new Error(`Module does not emit string as its default export`);
    }
    return css;
  });
