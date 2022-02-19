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
  });

  o('attempts to make wonky prefixes CSS safe', () => {
    o(scoped('.foo bar').startsWith('.foo_bar')).equals(true);
    o(scoped('.foo { bar: baz; }').startsWith('.foo___bar__baz____')).equals(true);
    o(scoped('(foo)').startsWith('_foo__')).equals(true);
    o(scoped('@media').startsWith('_media_')).equals(true);
  });
});
