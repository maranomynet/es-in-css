import o from 'ospec';

import { _scoped as scoped } from './scoped.private';

o.spec('scoped name generator', () => {
  o('outputs a new string every time', () => {
    const name1 = scoped();
    const name2 = scoped();
    const name3 = scoped();

    o(typeof name1 === 'string').equals(true);
    o(name1).notEquals(name2);
    o(name1).notEquals(name2);
    o(name2).notEquals(name3);
    o(/^[0-9a-z]{18,}$/.test(name1 + name2 + name3)).equals(true)(
      'all-alphanumerical minimum of 6 characters per name'
    );
  });

  o('accepts a prefix', () => {
    const prefixed = scoped('myPrefix');
    o(/^myPrefix_[0-9a-z]{6,}$/.test(prefixed)).equals(true);
    o(scoped('.fúú_bar-baz$').startsWith('.fúú_bar-baz$_')).equals(true)(
      'Allows periods and accented characters'
    );
  });

  o('attempts to make wonky prefixes CSS safe', () => {
    o(scoped(' foo--bar ').startsWith('foo--bar_')).equals(true)('Trims prefixes');
    o(scoped('.foo#id { bar:  baz; } ').startsWith('.foo_id___bar___baz____')).equals(
      true
    )('Does not collapse unsafe tokens');
    o(scoped('@media screen and (foo) ').startsWith('_media_screen_and__foo__')).equals(
      true
    )('@ symbols and parentheses are unsafe');
  });
});
