import o from 'ospec';

import { makeVariables, VariableStyles } from './makeVariables.js';
import { StrictEquals } from './test-utils.js';
import { px } from './units.js';

o.spec('variables helper', () => {
  const res = makeVariables([
    'componentWidth',
    'componentWidth--small',
    'componentWidth__large',
  ]);

  o('Allows generating CSS declarations', () => {
    o(
      res.declare({
        componentWidth: px(999),
        'componentWidth--small': '123px',
        componentWidth__large: 1500,
      })
    ).equals(
      [
        '--componentWidth: 999px;\n',
        '--componentWidth--small: 123px;\n',
        '--componentWidth__large: 1500;\n',
      ].join('')
    );
  });

  o('declarations trim values', () => {
    o(
      makeVariables(['foo']).declare({
        foo: ' 1\t ',
      })
    ).equals('--foo: 1;\n');
  });

  o('allows partially overriding declarations', () => {
    const overrides = res.override({
      componentWidth: '0px ',
      componentWidth__large: px(10),
    });
    o(overrides).equals(
      ['--componentWidth: 0px;\n', '--componentWidth__large: 10px;\n'].join('')
    );
  });

  o('overrides only known variables', () => {
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
    o(badOverrides).equals('--componentWidth: 1px;\n');
    o(badOverrides).equals(badDeclarations);
  });

  o('generates variable printers', () => {
    o(res.vars.componentWidth + '').equals('var(--componentWidth)');
    o(res.vars['componentWidth--small'] + '').equals('var(--componentWidth--small)');
    o(res.vars.componentWidth__large + '').equals('var(--componentWidth__large)');
    o(res.vars.componentWidth.or('defaultVal')).equals(
      'var(--componentWidth, defaultVal)'
    )('that can set defaults');
    // eslint-disable-next-line deprecation/deprecation
    o(res.vars.componentWidth.getName).equals(res.vars.componentWidth.toString)(
      'aliases toString as getName'
    );
  });

  o('variable printers expose the bare css variable name', () => {
    o(res.vars.componentWidth.cssName).equals('--componentWidth');
    o(res.vars['componentWidth--small'].cssName).equals('--componentWidth--small');
    o(res.vars.componentWidth__large.cssName).equals('--componentWidth__large');
  });

  o('accepts `VariablePrinter`s as values', () => {
    const { bar } = makeVariables(['bar']).vars;

    o(makeVariables(['foo']).declare({ foo: bar })).equals('--foo: var(--bar);\n');
  });

  o(
    'errors on malformed variable names and variable name tokens that require escaping',
    () => {
      // explicitly disallowed by the CSS spec
      o(() => makeVariables([''])).throws(Error);
      // Weird but ok...
      o(() => makeVariables(['--'])).notThrows(Error);
      o(() => makeVariables(['--xx'])).notThrows(Error);
      // Technically allowed, but just dumb.
      // By default, not supported by the variables helper.
      // Use the `nameRe` and `toCSSName` options.
      o(() => makeVariables([' linkColor'])).throws(Error);
      o(() => makeVariables(['????'])).throws(Error);
      o(() => makeVariables(['link color'])).throws(Error);
      o(() => makeVariables(['a:b'])).throws(Error);
      o(() => makeVariables(['a{b}'])).throws(Error);
      o(() => makeVariables(['ab()'])).throws(Error);
    }
  );

  o('allows passing custom name RegExp', () => {
    // only allow two-letter names with the letters "??" and "??"
    o(
      makeVariables(['????', '????'], {
        nameRe: /^[????]{2}$/i,
      }).declare({ ????: 'red', ????: 'blue' })
    ).equals('--????: red;\n--????: blue;\n')('only "??" and "??" combos of length 2');

    o(() => makeVariables(['hi'], { nameRe: /^[????]{2}$/i })).throws(Error)(
      'totally overrides the normal `nameRe`'
    );

    o(() => makeVariables(['link'])).notThrows(Error)(
      'default name patterns are unaffected'
    );
    o(() => makeVariables(['????', '????'])).throws(Error)(
      'default name patterns are unaffected 2'
    );

    // Rejects incomplete custom RegExp objects (must match from ^ to $)
    o(() => makeVariables(['????'], { nameRe: /[????]{2}/i })).throws(Error)(
      'rejects incomplete nameRe 1'
    );
    o(() => makeVariables(['????'], { nameRe: /^[????]{2}/ })).throws(Error)(
      'rejects incomplete nameRe 2'
    );
    o(() => makeVariables(['????'], { nameRe: /[????]{2}$/ })).throws(Error)(
      'rejects incomplete nameRe 3'
    );
  });

  o('allows passing custom name toCSSName mapper', () => {
    const res2 = makeVariables(['link__hover'], {
      toCSSName: (name) => name.replace(/_/g, '-'),
    });
    o(res2.declare({ link__hover: 'red' })).equals('--link--hover: red;\n');
    o('link__hover' in res2.vars).equals(true);
    o('link--hover' in res2.vars).equals(false);
    o(res2.vars.link__hover.cssName).equals('--link--hover')('cssName is also mapped');
    o(
      res2.override({
        // @ts-expect-error  (Invalid key)
        'link--hover': 'blue',
      })
    ).equals('');
    o(res2.override({ link__hover: 'blue' })).equals('--link--hover: blue;\n');

    o(() =>
      makeVariables(['link$$hover'], {
        toCSSName: (name) => name.replace(/$/g, '-'),
      })
    ).throws(Error)('toCSSName does not obviate the `nameRe` validation');
  });

  o('variables.join() combines multiple VariableStyle objects', () => {
    const d1 = makeVariables(['foo']);
    const d2 = makeVariables(['bar']);
    const joined = makeVariables.join(d1, d2);

    o(joined.vars.foo + '').equals('var(--foo)');
    o(joined.vars.bar + '').equals('var(--bar)');
    o(joined.declare({ foo: 1, bar: 'a' })).equals('--foo: 1;\n--bar: a;\n')(
      'declare method accepts all keys'
    );
    o(
      joined.override({
        foo: 42,
        // @ts-expect-error  (Invalid key)
        baz: 999,
      })
    ).equals('--foo: 42;\n')('Overrides work');

    const d1b = makeVariables(['foo']);
    const joined2 = makeVariables.join(d1, d1b);
    o(joined2.declare({ foo: 2 })).equals('--foo: 2;\n')(
      'Clashing/repeat declarations simply merge'
    );
    o(
      joined2.override({
        foo: 42,
        // @ts-expect-error  (Invalid key)
        bar: 33,
      })
    ).equals('--foo: 42;\n')('Overrides work for clashed objects');

    /* eslint-disable @typescript-eslint/no-unused-vars */
    const tsTest1: StrictEquals<typeof joined, VariableStyles<'foo' | 'bar'>> = true;
    const tsTest2: StrictEquals<typeof joined2, VariableStyles<'foo'>> = true;
    /* eslint-enable @typescript-eslint/no-unused-vars */
  });
});
