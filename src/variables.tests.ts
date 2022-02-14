import o from 'ospec';

import { variables } from './variables';
import { px } from '.';

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

  o(
    'errors on malformed variable names and variable name tokens that require escaping',
    () => {
      // explicitly disallowed by the CSS spec
      o(() => variables({ '': '100px' })).throws(Error);
      // Weird but ok...
      o(() => variables({ '--': '100px' })).notThrows(Error);
      o(() => variables({ '--xx': '100px' })).notThrows(Error);
      // Technically allowed, but just dumb. Not supported by the variables helper.
      // roll your own.
      o(() => variables({ ' linkColor': 'red' })).throws(Error);
      o(() => variables({ þú: 'red' })).throws(Error);
      o(() => variables({ 'link color': 'blue' })).throws(Error);
      o(() => variables({ 'a:b': 'yellow' })).throws(Error);
      o(() => variables({ 'a{b}': 'salmon' })).throws(Error);
      o(() => variables({ 'ab()': 'peach' })).throws(Error);
    }
  );

  o('allows setting (and resetting) variable name RegExp', () => {
    o(() => variables({ þú: 'red' })).throws(Error);
    // only allow two-letter names with the letters "þ" and "ú"
    variables.setNameRe(/^[þú]{2}$/i);
    o(variables({ þú: 'red', úþ: 'blue' }).declarations).equals(
      '--þú: red;\n--úþ: blue;\n'
    );
    o(() => variables({ link: 'red' })).throws(Error);
    o(() => variables({ þúþú: 'red' })).throws(Error);

    // reset back to the default name pattern
    variables.setNameRe();
    o(() => variables({ þú: 'red', úþ: 'blue' })).throws(Error);
    o(() => variables({ link: 'red' })).notThrows(Error);

    // rejects incomplete custom RegExp objects (must match from ^ to $)
    o(() => variables.setNameRe(/[áúíó]+/)).throws(Error);
    o(() => variables.setNameRe(/^[áúíó]+/)).throws(Error);
    o(() => variables.setNameRe(/[áúíó]+$/)).throws(Error);
    o(() => variables({ link: 'red' })).notThrows(Error);
  });
});
