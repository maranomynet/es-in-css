import o from 'ospec';

import { color } from './colors';
import { px } from './units';
import { variables, VariableStyles } from './variables';
import { deg, ms, pct, rem } from '.';

/** Testing helper */
type StrictEquals<A, B> = A extends B ? (B extends A ? true : false) : false;

o.spec('variables helper', () => {
  const res = variables({
    componentWidth: px(999),
    'componentWidth--small': '123px',
    componentWidth__large: 1500,
  });

  o('generates CSS declarations', () => {
    const expectedDecls = [
      '--componentWidth: 999px;\n',
      '--componentWidth--small: 123px;\n',
      '--componentWidth__large: 1500;\n',
    ].join('');
    o(res.declarations).equals(expectedDecls);

    const extraDecls = '@media  (prefers-color-scheme: dark) { componentWidth: 999px; }';
    res.declarations += extraDecls;
    o(res.declarations).equals(expectedDecls + extraDecls)(
      'declarations property is mutable'
    );
  });

  o('declarations trim values', () => {
    o(variables({ foo: ' 1\t ' }).declarations).equals('--foo: 1;\n');
  });

  o('allows selectively overriding declarations', () => {
    const declarationsBefore = res.declarations;
    const overrides = res.override({
      componentWidth: '0px ',
      componentWidth__large: px(10),
    });
    o(overrides).equals(
      ['--componentWidth: 0px;\n', '--componentWidth__large: 10px;\n'].join('')
    );
    o(res.declarations).equals(declarationsBefore)('without affecting the originals');
  });

  o('overrides only known variables', () => {
    const badOverrides = res.override({
      componentWidth: '1px',
      // @ts-expect-error  (Testing unknown keys)
      someUnknownVariable: '0px',
    });
    o(badOverrides).equals('--componentWidth: 1px;\n');
  });

  o('generates variable printers', () => {
    o(res.vars.componentWidth()).equals('var(--componentWidth)');
    o(res.vars['componentWidth--small']()).equals('var(--componentWidth--small)');
    o(res.vars.componentWidth__large()).equals('var(--componentWidth__large)');
    o(res.vars.componentWidth()).equals(res.vars.componentWidth.toString());
    o(res.vars.componentWidth('defaultVal')).equals('var(--componentWidth, defaultVal)')(
      'that can set defaults'
    );
  });

  o('variable printers know the type of the value', () => {
    const vars = variables({
      z1: 0,
      z2: '0',
      z3: '-0',
      s1: px(123),
      s2: rem(1.5),
      s3: '-2em', // simple strings are paresed
      t1: ms(500),
      t2: '.5s',
      a: deg(90),
      p1: pct(1.5),
      p2: '115.5%', // strings are paresed
      c1: color('blue'),
      c2: '#ff0000ff', // strings are parsed
      c3: 'rgba(123, 0, 0, .9)',
      c4: 'currentColor',
      n1: 123,
      n2: '1.23',
      u1: `0 ${px(123)}`,
      u2: '13furlong',
    }).vars;

    o(vars.z1.type).equals('zero');
    o(vars.z2.type).equals('zero');
    o(vars.z3.type).equals('zero');
    o(vars.s1.type).equals('size:px');
    o(vars.s2.type).equals('size:rem');
    o(vars.s3.type).equals('size:em');
    o(vars.t1.type).equals('time:ms');
    o(vars.t2.type).equals('time:s');
    o(vars.a.type).equals('angle:deg');
    o(vars.p1.type).equals('percent');
    o(vars.p2.type).equals('percent');
    o(vars.c1.type).equals('color');
    o(vars.c2.type).equals('color');
    o(vars.c3.type).equals('color');
    o(vars.c4.type).equals('color');
    o(vars.n1.type).equals('number');
    o(vars.n2.type).equals('number');
    o(vars.u1.type).equals('unknown');
    o(vars.u2.type).equals('unknown');
  });

  o('accepts `VariablePrinter`s as values', () => {
    const { bar } = variables({ bar: '#f98' }).vars;
    const { vars, declarations } = variables({ foo: bar });

    o(declarations + '').equals('--foo: var(--bar);\n');
    o(vars.foo.type).equals('color');
  });

  o(
    'errors on malformed variable names and variable name tokens that require escaping',
    () => {
      // explicitly disallowed by the CSS spec
      o(() => variables({ '': '100px' })).throws(Error);
      // Weird but ok...
      o(() => variables({ '--': '100px' })).notThrows(Error);
      o(() => variables({ '--xx': '100px' })).notThrows(Error);
      // Technically allowed, but just dumb.
      // By default, not supported by the variables helper.
      // Use the `nameRe` and `toCSSName` options.
      o(() => variables({ ' linkColor': 'red' })).throws(Error);
      o(() => variables({ þú: 'red' })).throws(Error);
      o(() => variables({ 'link color': 'blue' })).throws(Error);
      o(() => variables({ 'a:b': 'yellow' })).throws(Error);
      o(() => variables({ 'a{b}': 'salmon' })).throws(Error);
      o(() => variables({ 'ab()': 'peach' })).throws(Error);
    }
  );

  o('allows passing custom name RegExp', () => {
    // only allow two-letter names with the letters "þ" and "ú"
    o(
      variables(
        {
          þú: 'red',
          úþ: 'blue',
        },
        { nameRe: /^[þú]{2}$/i }
      ).declarations
    ).equals('--þú: red;\n--úþ: blue;\n')('only "þ" and "ú" combos of length 2');
    o(() => variables({ hi: 'red' }, { nameRe: /^[þú]{2}$/i })).throws(Error)(
      'totally overrides the normal `nameRe`'
    );

    o(() => variables({ link: 'red' })).notThrows(Error)(
      'default name patterns are unaffected'
    );
    o(() => variables({ þú: 'red', úþ: 'blue' })).throws(Error)(
      'default name patterns are unaffected 2'
    );

    // Rejects incomplete custom RegExp objects (must match from ^ to $)
    o(() => variables({ þú: 'red' }, { nameRe: /[þú]{2}/i })).throws(Error)(
      'rejects incomplete nameRe 1'
    );
    o(() => variables({ þú: 'red' }, { nameRe: /^[þú]{2}/ })).throws(Error)(
      'rejects incomplete nameRe 2'
    );
    o(() => variables({ þú: 'red' }, { nameRe: /[þú]{2}$/ })).throws(Error)(
      'rejects incomplete nameRe 3'
    );
  });

  o('allows passing custom name toCSSName mapper', () => {
    const res2 = variables(
      { link__hover: 'red' },
      { toCSSName: (name) => name.replace(/_/g, '-') }
    );
    o(res2.declarations).equals('--link--hover: red;\n');
    o('link__hover' in res2.vars).equals(true);
    o('link--hover' in res2.vars).equals(false);
    o(
      res2.override({
        // @ts-expect-error  (Invalid key)
        'link--hover': 'blue',
      })
    ).equals('');
    o(res2.override({ link__hover: 'blue' })).equals('--link--hover: blue;\n');

    o(() =>
      variables({ link$$hover: 'red' }, { toCSSName: (name) => name.replace(/$/g, '-') })
    ).throws(Error)('toCSSName does not obviate the `nameRe` validation');
  });

  o('allows passing custom resolveType and isColor function', () => {
    const { vars } = variables(
      {
        normal: '40px',
        custom: '42px',
        color: 'blue',
        customColor: 'blár',
      },
      {
        resolveType: (value) => (value === '42px' ? 'ultimate' : undefined),
        isColor: (value) => value === 'blár',
      }
    );
    o(vars.normal.type).equals('size:px');
    o(vars.custom.type).equals('ultimate');
    o(vars.color.type).equals('color');
    o(vars.customColor.type).equals('color');
  });

  o('variables.join() combines multiple VariableStyle objects', () => {
    const d1 = variables({ foo: 1 });
    d1.declarations += 'funk\n';
    const d2 = variables({ bar: 'a' });

    const joined = variables.join(d1, d2);
    o(joined.vars.foo()).equals('var(--foo)');
    o(joined.vars.bar()).equals('var(--bar)');
    o(joined.declarations).equals('--foo: 1;\nfunk\n--bar: a;\n')(
      'retains mutated declaration values'
    );
    o(
      joined.override({
        foo: 42,
        // @ts-expect-error  (Invalid key)
        baz: 999,
      })
    ).equals('--foo: 42;\n')('Overrides work');

    const d1b = variables({ foo: 2 });
    const joined2 = variables.join(d1, d1b);
    o(joined2.declarations).equals('--foo: 1;\nfunk\n--foo: 2;\n')(
      'does *NOT* de-duplicate clashing/repeat declarations'
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
