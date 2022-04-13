import { resolve } from 'path';

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
export const getExportedCSS = (filePath: string) => {
  const url = resolve('', filePath);
  // When `import()`-ing a commonjs modules, simply adding a cacheBust param will
  // NOTE invalidate the cache. (node 14 and 16 at least)
  delete require.cache[require.resolve(url)];

  const cacheBust = '?' + Date.now();
  return import(url + cacheBust).then(extractDefaultExport).then((css) => {
    if (css == null) {
      throw new Error(`Module does not emit string as its default export`);
    }
    return css;
  });
};
