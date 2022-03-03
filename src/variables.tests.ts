import o from 'ospec';

import { color } from './colors';
import { px } from './units';
import { variables } from './variables';
import { deg, ms, pct, rem } from '.';

o.spec('variables helper', () => {
  const res = variables({
    componentWidth: px(999),
    'componentWidth--small': '123px',
    componentWidth__large: 1500,
  });

  o('generates CSS declarations', () => {
    o(res.declarations).equals(
      [
        '--componentWidth: 999px;\n',
        '--componentWidth--small: 123px;\n',
        '--componentWidth__large: 1500;\n',
      ].join('')
    );
  });

  o('declarations trim values', () => {
    o(variables({ foo: ' 1\t ' }).declarations).equals('--foo: 1;\n');
  });

  o('allows selecctively overriding declarations', () => {
    const declarationsBefore = res.declarations;
    const overrides = res.override({
      componentWidth: '0px ',
      componentWidth__large: '10px',
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

    // TODO: Add typing support … maybe?
    const z1 /* : 'zero' */ = vars.z1.type;
    const z2 /* : 'zero' */ = vars.z2.type;
    const z3 /* : 'zero' */ = vars.z3.type;
    const s1 /* : 'size:px' */ = vars.s1.type;
    const s2 /* : 'size:rem' */ = vars.s2.type;
    const s3 /* : 'size:em' */ = vars.s3.type;
    const t1 /* : 'time:ms' */ = vars.t1.type;
    const t2 /* : 'time:ms' */ = vars.t2.type;
    const a /* : 'angle:deg' */ = vars.a.type;
    const p1 /* : 'color' */ = vars.p1.type;
    const p2 /* : 'color' */ = vars.p2.type;
    const c1 /* : 'color' */ = vars.c1.type;
    const c2 /* : 'color' */ = vars.c2.type;
    const c3 /* : 'color' */ = vars.c3.type;
    const c4 /* : 'color' */ = vars.c4.type;
    const n1 /* : 'number' */ = vars.n1.type;
    const n2 /* : 'number' */ = vars.n2.type;
    const u1 /* : 'unknown' */ = vars.u1.type;
    const u2 /* : 'unknown' */ = vars.u2.type;

    o(z1).equals('zero');
    o(z2).equals('zero');
    o(z3).equals('zero');
    o(s1).equals('size:px');
    o(s2).equals('size:rem');
    o(s3).equals('size:em');
    o(t1).equals('time:ms');
    o(t2).equals('time:s');
    o(a).equals('angle:deg');
    o(p1).equals('percent');
    o(p2).equals('percent');
    o(c1).equals('color');
    o(c2).equals('color');
    o(c3).equals('color');
    o(c4).equals('color');
    o(n1).equals('number');
    o(n2).equals('number');
    o(u1).equals('unknown');
    o(u2).equals('unknown');
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
});
