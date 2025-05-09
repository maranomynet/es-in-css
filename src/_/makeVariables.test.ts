import type { Equals } from '@maranomynet/libtools';
import { describe, expect, test } from 'bun:test';

import { CssString } from './css.js';
import { makeVariables, VariableOptions, VariableStyles } from './makeVariables.js';
import { px } from './units.js';

/** Converts the CSS a string type for easier matching */
const Expect = (css: CssString) => expect(css as string);

// ===========================================================================

describe('variables helper', () => {
  const res = makeVariables([
    'componentWidth',
    'componentWidth--small',
    'componentWidth__large',
  ]);

  test('Allows generating CSS declarations', () => {
    Expect(
      res.declare({
        componentWidth: px(999),
        'componentWidth--small': '123px',
        componentWidth__large: 1500,
      })
    ).toBe(
      [
        '--componentWidth: 999px;\n',
        '--componentWidth--small: 123px;\n',
        '--componentWidth__large: 1500;\n',
      ].join('')
    );
  });

  test('declarations trim values', () => {
    Expect(
      makeVariables(['foo']).declare({
        foo: ' 1\t ',
      })
    ).toBe('--foo: 1;\n');
  });

  test('allows partially overriding declarations', () => {
    const overrides = res.override({
      componentWidth: '0px ',
      componentWidth__large: px(10),
    });
    Expect(overrides).toBe(
      ['--componentWidth: 0px;\n', '--componentWidth__large: 10px;\n'].join('')
    );
    const overrides2 = res.override({
      componentWidth: undefined,
      componentWidth__large: null,
      'componentWidth--small': false,
    });
    Expect(overrides2).toBe('');
  });

  test('overrides only known variables', () => {
    const badDeclarations = res.declare({
      componentWidth: '1px',
      // @ts-expect-error  (Testing unknown keys)
      someUnknownVariable: '0px',
    });
    const badOverrides = res.override({
      componentWidth: '1px',
      // @ts-expect-error  (Testing unknown keys)
      someUnknownVariable: '0px',
    });
    Expect(badOverrides).toBe('--componentWidth: 1px;\n');
    Expect(badOverrides).toBe(badDeclarations);
  });

  test('generates variable printers', () => {
    expect(`${res.vars.componentWidth}`).toBe('var(--componentWidth)');
    expect(`${res.vars['componentWidth--small']}`).toBe('var(--componentWidth--small)');
    expect(`${res.vars.componentWidth__large}`).toBe('var(--componentWidth__large)');
    // that can set defaults
    Expect(res.vars.componentWidth.or('defaultVal')).toBe(
      'var(--componentWidth, defaultVal)'
    );
    // aliases toString as getName
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    expect(res.vars.componentWidth.getName).toBe(res.vars.componentWidth.toString);
  });

  test('variable printers expose the bare css variable name', () => {
    expect(res.vars.componentWidth.cssName).toBe('--componentWidth');
    expect(res.vars['componentWidth--small'].cssName).toBe('--componentWidth--small');
    expect(res.vars.componentWidth__large.cssName).toBe('--componentWidth__large');
  });

  test('accepts `VariablePrinter`s as values', () => {
    const { bar } = makeVariables(['bar']).vars;

    Expect(makeVariables(['foo']).declare({ foo: bar })).toBe('--foo: var(--bar);\n');
  });

  test('errors on malformed variable names and variable name tokens that require escaping', () => {
    // explicitly disallowed by the CSS spec
    expect(() => makeVariables([''])).toThrow(Error);
    // Weird but ok...
    expect(() => makeVariables(['--'])).not.toThrow();
    expect(() => makeVariables(['--xx'])).not.toThrow();
    // Technically allowed, but just dumb.
    // By default, not supported by the variables helper.
    // Use the `nameRe` and `toCSSName` options.
    expect(() => makeVariables([' linkColor'])).toThrow(Error);
    expect(() => makeVariables(['þú'])).toThrow(Error);
    expect(() => makeVariables(['link color'])).toThrow(Error);
    expect(() => makeVariables(['a:b'])).toThrow(Error);
    expect(() => makeVariables(['a{b}'])).toThrow(Error);
    expect(() => makeVariables(['ab()'])).toThrow(Error);
  });

  test('accepts a custom namespace prefix option', () => {
    const res2 = makeVariables(['bar'], { namespace: 'FOO' });
    Expect(res2.declare({ bar: 0 })).toBe('--FOObar: 0;\n');
    expect(res2.vars.bar.cssName).toBe('--FOObar');
    expect(res2.vars.bar.toString()).toBe('var(--FOObar)');
  });

  test('silently strips invalid characters from custom namespaces', () => {
    const res2 = makeVariables(['bar'], { namespace: ' (F) \t;:O\n{O}[@] ' });
    expect(res2.vars.bar.cssName).toBe('--FOObar');
  });

  test('allows passing custom name RegExp', () => {
    // only allow two-letter names with the letters "þ" and "ú" of length 2
    Expect(
      makeVariables(['þú', 'úþ'], {
        nameRe: /^[þú]{2}$/i,
      }).declare({ þú: 'red', úþ: 'blue' })
    ).toBe('--þú: red;\n--úþ: blue;\n');

    // nameRe option does not apply to namespace
    Expect(
      makeVariables(['þú'], {
        nameRe: /^[þú]{2}$/i,
        namespace: 'foobar-',
      }).declare({ þú: 1 })
    ).toBe('--foobar-þú: 1;\n');

    // totally overrides the normal `nameRe`
    expect(() => makeVariables(['hi'], { nameRe: /^[þú]{2}$/i })).toThrow(Error);

    // default name patterns are unaffected
    expect(() => makeVariables(['link'])).not.toThrow(Error);

    // default name patterns are unaffected 2
    expect(() => makeVariables(['þú', 'úþ'])).toThrow(Error);

    // Rejects incomplete custom RegExp objects (must match from ^ to $)

    // rejects incomplete nameRe 1
    expect(() => makeVariables(['þú'], { nameRe: /[þú]{2}/i })).toThrow(Error);

    // rejects incomplete nameRe 2
    expect(() => makeVariables(['þú'], { nameRe: /^[þú]{2}/ })).toThrow(Error);

    // rejects incomplete nameRe 3
    expect(() => makeVariables(['þú'], { nameRe: /[þú]{2}$/ })).toThrow(Error);
  });

  test('allows passing custom name toCSSName mapper', () => {
    const res2 = makeVariables(['link__hover'], {
      toCSSName: (name) => name.replace(/_/g, '-'),
    });
    Expect(res2.declare({ link__hover: 'red' })).toBe('--link--hover: red;\n');
    expect('link__hover' in res2.vars).toBe(true);
    expect('link--hover' in res2.vars).toBe(false);

    // cssName is also mapped
    expect(res2.vars.link__hover.cssName).toBe('--link--hover');

    Expect(
      res2.override({
        // @ts-expect-error  (Invalid key)
        'link--hover': 'blue',
      })
    ).toBe('');
    Expect(res2.override({ link__hover: 'blue' })).toBe('--link--hover: blue;\n');

    // toCSSName does not obviate the `nameRe` validation
    expect(() =>
      makeVariables(['link$$hover'], {
        toCSSName: (name) => name.replace(/$/g, '-'),
      })
    ).toThrow(Error);

    // namespace is not passed through toCSSName
    Expect(
      makeVariables(['link__hover'], {
        toCSSName: (name) => name.replace(/_/g, '-'),
        namespace: 'foobar__',
      }).declare({ link__hover: 'red' })
    ).toBe('--foobar__link--hover: red;\n');
  });

  test('variables.join() combines multiple VariableStyle objects', () => {
    const d1 = makeVariables(['foo']);
    const d2 = makeVariables(['bar']);
    const joined = makeVariables.join(d1, d2);

    expect(`${joined.vars.foo}`).toBe('var(--foo)');
    expect(`${joined.vars.bar}`).toBe('var(--bar)');
    // declare method accepts all keys
    Expect(joined.declare({ foo: 1, bar: 'a' })).toBe('--foo: 1;\n--bar: a;\n');

    // Overrides work
    Expect(
      joined.override({
        foo: 42,
        // @ts-expect-error  (Invalid key)
        baz: 999,
      })
    ).toBe('--foo: 42;\n');

    const d1b = makeVariables(['foo']);
    const joined2 = makeVariables.join(d1, d1b);
    // Clashing/repeat declarations simply merge
    Expect(joined2.declare({ foo: 2 })).toBe('--foo: 2;\n');

    // Overrides work for clashed objects
    Expect(
      joined2.override({
        foo: 42,
        // @ts-expect-error  (Invalid key)
        bar: 33,
      })
    ).toBe('--foo: 42;\n');

    /* eslint-disable @typescript-eslint/no-unused-vars */
    const tsTest1: Equals<typeof joined, VariableStyles<'foo' | 'bar'>> = true;
    const tsTest2: Equals<typeof joined2, VariableStyles<'foo'>> = true;

    const opts1: VariableOptions = { nameRe: /^.+$/ };
    const opts2: VariableOptions = { toCSSName: (n: string) => n };
    const opts3: VariableOptions = { namespace: '' };
    /* eslint-enable @typescript-eslint/no-unused-vars */
  });

  test('namespaces survive variables.join()', () => {
    const nsJoined = makeVariables.join(
      makeVariables(['foo']),
      makeVariables(['bar'], { namespace: 'X-' })
    );
    expect(`${nsJoined.vars.bar}`).toBe('var(--X-bar)');
    Expect(nsJoined.declare({ foo: 1, bar: 2 })).toBe('--foo: 1;\n--X-bar: 2;\n');
    Expect(nsJoined.override({ bar: 3 })).toBe('--X-bar: 3;\n');
  });
});

// ===========================================================================
