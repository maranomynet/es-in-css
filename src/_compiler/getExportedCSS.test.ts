import { describe, expect, test } from 'bun:test';

import { extractDefaultExport as e } from './getExportedCSS.js';

// ===========================================================================

describe('getExportedCSS', () => {
  test('extracts default exported strings', () => {
    expect(e({ default: 'foo' })).toBe('foo');
    expect(e({ default: '' })).toBe('');
  });

  test('extracts default exported strings from wrapped esm->commonjs modules', () => {
    expect(e({ default: { default: 'bar' } })).toBe('bar');
    expect(e({ default: { default: '' } })).toBe('');
  });

  test('returns undefined for weird/bad input', () => {
    expect(e(undefined)).toBeUndefined();
    expect(e(null)).toBeUndefined();
    expect(e(42)).toBeUndefined();
    expect(e({})).toBeUndefined();
    expect(e([])).toBeUndefined();

    expect(e({ default: undefined })).toBeUndefined();
    expect(e({ default: null })).toBeUndefined();
    expect(e({ default: 42 })).toBeUndefined();
    expect(e({ default: {} })).toBeUndefined();
    expect(e({ default: [] })).toBeUndefined();

    expect(e({ css: 'hello' })).toBeUndefined();
  });
});

// ===========================================================================
