**Concept work in progress. No actual code here yet.**

---

# js-in-css

This library serves much of the same purpose as SASS/SCSS, LESS and other CSS
preprocessors, but uses plain JavaScript/TypeScript to provide the
"programmability" of local variables, mixins, utility functions, etc. etc.

Overall this is a "do less" toolkit with tiny API, that mainly tries to stay
out of your way.

Selector nesting and autoprefixer features are automoatically provided by
`postCSS`, but apart from that it's all pretty basic. Just you composing CSS.

For good developer experience, it'd be best to use VSCode with the
[**vscode-styled-components** extension](https://marketplace.visualstudio.com/items?itemName=stmponents.vscode-stmponents)
for instant syntax highlighting and IntelliSense autocomplete inside the CSS
template literals.

## Quick-Start Guide

```sh
yarn add --dev js-in-css
```

Create a file called `src/cool-design.css.ts`:

```ts
import { css, variables, px } from 'js-in-css';

const colors = {
  yellow: `yellow`,
  red: `#cc3300`,
  purple: `#990099`,
};

const bp = { large: 850 };
const mq = {
  small: `screen and (max-width: ${px(bp.large - 1)})`
  large: `screen and (min-width: ${px(bp.large)})`
};

const cssVars = variables({
  linkColor: colors.red,
  'linkColor--hover': colors.purple, // dashes must be quoted
  linkColor__focus: `var(--focusColor)`;
  focusColor: `peach`;
});
const vars = cssVars.vars;

export default css`
  :root {
    ${cssVars.declarations}
  }

  a[href] {
    color: ${vars.linkColor};
    unknown-property: is ok;

    &:hover {
      color: ${vars['linkColor--hover']};
    }
    &:focus-visible {
      color: ${vars.linkColor__focus};
    }
  }

  @media ${mq.large} {
    html {
      background-color: ${colors.yellow};
    }
  }
`
```

Then build the CSS file with the command:

```sh
./node_modules/.bin/js-in-css src/*.css.ts --dest dist/styles
```

Now you have a file called `dest/styles/cool-design.css`:

```css
:root {
  --linkColor: #cc3300;
  --linkColor--hover: #990099;
  --linkColor__focus: var(--focusColor);
  --focusColor: peach;
}
a[href] {
  color: var(--linkColor);
  unknown-property: is ok;
}
a[href]:hover {
  color: var(--linkColor--hover);
}
a[href]:focus-visible {
  color: var(--linkColor__focus);
}
@media screen and (min-width: 850px) {
  html {
    background-color: yellow;
  }
}
```

## Features

The `js-in-css` module exports the following methods:

### ` css``  `

Dumb tagged template literal that returns a `string`.

```ts
import { css } from 'js-in-css';

const themeColors = {
  yellow: `yellow`,
  red: `#cc3300`,
  purple: `#990099`,
};
const textColor = `#333`;

export default css`
  body {
    color: ${textColor};
  }

  ${Object.entries(themeColors).map(
    (color) => css`
      body.theme--${color.name} {
        background-color: ${color.value};
      }
    `
  )}
`;
```

### `variables<T extends string>(vars: Record<T, string>): VariableData<T>`

`VariableData<T>.declarations` contains CSS string with all the custom
property declarations, ready to be dumped into a CSS rule block.

`VariableData<T>.vars` is a readonly `Record<T, string>` object with the full
variable names wrapped in `var()` ready to be used as values.

```ts
import { variables } from 'js-in-css';

const cssVars = variables({
  linkColor: `#0000ff`,
  linkColor__hover: `#cc00cc`,
});

cssVars.declarations;
/*`
  --linkColor: #0000ff;
  --linkColor__hover: #cc00cc;
`*/

cssVars.vars.linkColor;
// `var(--linkColor)`
cssVars.vars.linkColor__hover;
// `var(--linkColor__hover)`
```

### `scoped(prefix?: string): string`

Returns a randomized/unique string token, with an optional `prefix`. These
tokens can be using for naming `@keyframes` or for mangled class-names, if
that's what you need:

```ts
import { scoped, css } from 'js-in-css';

export const blockName = scoped(`.Button`); // 'Button_4af51c0d267'

export default css`
  .${blockName} {
    border: 1px solid blue;
  }
  .${blockName}__title {
    font-size: 2rem;
  }
`;
/*`
  .Button_4af51c0d267 { border: 1px solid blue; }
  .Button_4af51c0d267__title { font-size: 2rem; }
`*/
```

### Unit functions `px`, `em`, `rem`, `pct`, `vh`, `vw`, `s`, `ms`, etc.

```ts
import { px, css } from 'js-in-css';

const leftColW = px(300);
const mainColW = px(700);
const gutter = px(50);
const totalWidth = px(leftColW + gutter + mainColW);

export default css`
  .layout {
    width: ${totalWidth};
    margin: 0 auto;
    display: flex;
    gap: ${gutter};
  }
  .main {
    width: ${mainColW};
  }
  .sidebar {
    width: ${leftColW};
  }
`;
/*`
  .layout { width: 1000px; margin: 0 auto; display: flex; gap: 50px; }
  .main { width: 700px; }
  .sidebar { width: 300px; }
`*/
```

## Roadmap

- Make css minification optional
- Add more helpful methods, including color functions, unit values, etc.
- Expose a JavaScript build API

NOTE: Emitting sourcemaps is **not** planned at the moment.
