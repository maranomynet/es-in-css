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

// Side-step tsc's conversion of dynamic imports to __importStar(require(url))
// See this issue: https://github.com/microsoft/TypeScript/issues/43329
const _import = new Function('url', 'return import(url)') as (
  url: string
) => Promise<unknown>;

/**
 * Imports default exported CSS from an input file.
 * Resolves esm—commonjs wrappers if neccessary.
 */
export const getExportedCSS = (filePath: string) => {
  const url = resolve('', filePath);
  // When `import()`-ing a commonjs modules, simply adding a cacheBust param will
  // NOT invalidate the cache. (node 14 and 16 at least)
  const require = global.require;
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (require && require.cache && require.resolve) {
    delete require.cache[require.resolve(url)];
  }

  const cacheBust = `?${Date.now()}`;
  return _import(url + cacheBust)
    .then(extractDefaultExport)
    .then((css) => {
      if (css == null) {
        throw new Error(`Module does not emit string as its default export`);
      }
      return css;
    });
};
