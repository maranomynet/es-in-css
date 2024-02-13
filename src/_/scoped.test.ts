import { describe, expect, test } from 'bun:test';

import { _scoped as scoped } from './scoped.private.js';

// ===========================================================================

describe('scoped name generator', () => {
  test('outputs a new string every time', () => {
    const name1 = scoped();
    const name2 = scoped();
    const name3 = scoped();

    expect(typeof name1 === 'string').toBe(true);
    expect(name1).not.toBe(name2);
    expect(name1).not.toBe(name2);
    expect(name2).not.toBe(name3);
    // all-alphanumerical minimum of 6 characters per name
    expect(/^[0-9a-z]{18,}$/.test(name1 + name2 + name3)).toBe(true);
  });

  test('accepts a prefix', () => {
    const prefixed = scoped('myPrefix');
    expect(/^myPrefix_[0-9a-z]{6,}$/.test(prefixed)).toBe(true);
    // Allows periods and accented characters
    expect(scoped('.fúú_bar-baz$').startsWith('.fúú_bar-baz$_')).toBe(true);
  });

  test('attempts to make wonky prefixes CSS safe', () => {
    // Trims prefixes
    expect(scoped(' foo--bar ').startsWith('foo--bar_')).toBe(true);
    // Does not collapse unsafe tokens
    expect(scoped('.foo#id { bar:  baz; } ').startsWith('.foo_id___bar___baz____')).toBe(
      true
    );
    // @ symbols and parentheses are unsafe
    expect(
      scoped('@media screen and (foo) ').startsWith('_media_screen_and__foo__')
    ).toBe(true);
  });
});

// ===========================================================================
