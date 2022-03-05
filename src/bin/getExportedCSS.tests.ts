import o from 'ospec';

import { extractDefaultExport as e } from './getExportedCSS';

o.spec('getExportedCSS', () => {
  o('extracts default exported strings', () => {
    o(e({ default: 'foo' })).equals('foo');
    o(e({ default: '' })).equals('');
  });

  o('extracts default exported strings from wrapped esm->commonjs modules', () => {
    o(e({ default: { default: 'bar' } })).equals('bar');
    o(e({ default: { default: '' } })).equals('');
  });

  o('returns undefined for weird/bad input', () => {
    o(e(undefined)).equals(undefined);
    o(e(null)).equals(undefined);
    o(e(42)).equals(undefined);
    o(e({})).equals(undefined);
    o(e([])).equals(undefined);

    o(e({ default: undefined })).equals(undefined);
    o(e({ default: null })).equals(undefined);
    o(e({ default: 42 })).equals(undefined);
    o(e({ default: {} })).equals(undefined);
    o(e({ default: [] })).equals(undefined);

    o(e({ css: 'hello' })).equals(undefined);
  });
});
