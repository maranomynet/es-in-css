**Concept work in progress. Very little actual code here yet.**

---

# js-in-css

This library serves much of the same purpose as SASS/SCSS, LESS and other CSS
preprocessors, but uses plain JavaScript/TypeScript to provide the
"programmability" of local variables, mixins, utility functions, etc. etc.

Overall this is a "do less" toolkit with tiny API, that mainly tries to stay
out of your way.

Selector nesting, `//` comment support and autoprefixer features are
automatically provided by `postCSS`, but apart from that it's all pretty
basic. Just you composing CSS.

For good developer experience, it'd be best to use VSCode with the official
[**vscode-styled-components** extension](https://marketplace.visualstudio.com/items?itemName=styled-components.vscode-styled-components)
for instant syntax highlighting and IntelliSense autocompletion inside
` css``  ` template literals.

<!-- prettier-ignore-start -->

- [Quick-Start Guide](#quick-start-guide)
- [CSS Authoring Features](#css-authoring-features)
  - [`css` Templater](#css-templater)
  - [`scoped` Name Generator](#scoped-name-generator)
  - [Unit Value Helpers](#unit-value-helpers)
  - [Unit Converters](#unit-converters)
  - [`variables` Helper](#variables-helper)
    - [`VariableData.declarations`](#variabledatadeclarations)
    - [`VariableData.vars`](#variabledatavars)
    - [`VariableData.override`](#variabledataoverride)
    - [`VariableOptions`](#variableoptions)
- [Compilation API](#compilation-api)
  - [CLI Syntax](#cli-syntax)
  - [CLI Example Usage](#cli-example-usage)
- [Roadmap](#roadmap)
  - [Maybe:](#maybe)
  - [Not planned:](#not-planned)

<!-- prettier-ignore-end -->

## Quick-Start Guide

```sh
yarn add --dev js-in-css
```

Create a file called `src/cool-design.css.js`:

```ts
import { css, variables, px } from 'js-in-css';

const colors = {
  yellow: `yellow`,
  red: `#cc3300`,
  purple: `#990099`,
};

const bp = { large: 850 };
const mq = {
  small: `screen and (max-width: ${px(bp.large - 1)})`,
  large: `screen and (min-width: ${px(bp.large)})`,
};

const cssVars = variables({
  linkColor: colors.red,
  'linkColor--hover': colors.purple, // dashes must be quoted
  linkColor__focus: `var(--focusColor)`,
  focusColor: `peach`,
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
`;
```

Then build/compile the CSS file with the command:

```sh
yarn run js-in-css "src/*.css.js" --outdir=dist/styles
```

or using npm:

```sh
npm exec js-in-css "src/*.css.js" --outdir=dist/styles`
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

## CSS Authoring Features

The `js-in-css` module exports the following methods:

### `css` Templater

**Syntax:** <code>css\`...`: string</code>

Dumb tagged template literal that returns a `string`. Mostly it guarantees
nice syntax highlighting and code-completion in VSCode by using a well-known
name.

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

### `scoped` Name Generator

**Syntax:** `scoped(prefix?: string): string`

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
  .Button_4af51c0d267 {
    border: 1px solid blue;
  }
  .Button_4af51c0d267__title {
    font-size: 2rem;
  }
`*/
```

### Unit Value Helpers

**Fixed sizes:** `px()` and `cm()`

**Type relative:** `em()`, `rem()`, `ch()` and `ex()`

**Layout relative:** `pct()` (%), `vh()`, `vw()`, `vmin()` and `vmax()`

**Time:** `ms()`

These return light-weight object instances that can still be mostly treated as
string **and** number liters depending on the context.

```ts
import { px, css } from 'js-in-css';

const leftColW = px(300);
const mainColW = px(700);
const gutter = px(50);
// Calculations work as if they're numbers
const totalWidth = px(leftColW + gutter + mainColW);

export default css`
  .layout {
    // But the unit suffix appears when printed
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
  .layout {
    /* But the unit suffix appears when printed *​/
    width: 1050px;
    margin: 0 auto;
    display: flex;
    gap: 50px;
  }
  .main {
    width: 700px;
  }
  .sidebar {
    width: 300px;
  }
`*/
```

### Unit Converters

100-based percentage values from proportions/fractions:  
`pct_f()`, `vh_f()`, `vw_f()`, `vmin_f()` and `vmax_f()`.

```js
pct_f(1 / 3); // 33.33333%   (Same as `pct(100 * 1/3)`)
vw_f(370 / 1400); // 26.42857143vw
```

Milliseconds from seconds:  
`ms_sec()`

```js
ms_sec(1.2); // 1200ms
```

Centimeters from other physical units:  
`cm_in()`, `cm_mm()`, `cm_pt()` and `cm_pc()`.

```js
cm_mm(33.3); // 3.33cm
cm_in(1); // 2.54cm
```

### `variables` Helper

**Syntax:**
`variables<T extends string>(vars: Record<T, VariableValue>, options?: VariableOptions): VariableData<T>`

Helper to provide type-safety and code-completion when using CSS custom
properties (CSS variables) at scale.

```ts
import { variables, css } from 'js-in-css';

const cssVars = variables({
  linkColor: `#0000ff`,
  linkColor__hover: `#cc00cc`,
});
```

The returned objects contains the following:

#### `VariableData.declarations`

**Syntax:** `VariableData<T>.declarations: string`

Is a CSS string with all the custom property declarations, ready to be dumped
into a CSS rule block.

```ts
cssCars.declarations;
/*`
  --linkColor: #0000ff;
  --linkColor__hover: #cc00cc;
`*/
```

#### `VariableData.vars`

**Syntax:** `VariableData<T>.vars: Record<T, VariablePrinter>`

Holds a readonly `Record<T, VariablePrinter>` object where the
`VariablePrinter`s emit the CSS variable names wrapped in `var()`, ready to be
used as CSS values … with the option of passing a default/fallback value.

```ts
const { vars } = cssVars;

vars.linkColor(); // also works
// `var(--linkColor)`

vars.linkColor(`fallback`); // pass fallback value
// `var(--linkColor, fallback)`

vars.linkColor + ''; // invokes .toString()
// `var(--linkColor)`

`color: ${vars.linkColor__hover};`;
// `color: var(--linkColor__hover);`
```

#### `VariableData.override`

**Syntax:** `VariableData<T>.override(vars: { [P in T]?: string }): string`

Returns string with redeclarations for any of the variables of type `T`.
Property names not matching `T` are dropped/ignored.

```ts
const { declarations } = cssVars;

const overrideStr = cssVars.override({
  linkColor: `#ff0000`,
  newVariable: `#ffffff`, // ignored/dropped
});
/*`
  --linkColor: #ff0000;
`*/

cssVars.declarations === declarations;
// true
```

#### `VariableOptions`

By default only "simple" ascii alphanumerical variable-names are allowed
(`/^[a-z0-9_-]+$/i`). If unsuppored/malformed variables names are passed, the
function throws an error. However, you can author your own `RegExp` to
validate the variable names, and a custom CSS variable-name mapper:

**`VariableOptions.nameRe?: RegExp`**

```ts
// Default behaviour rejects the 'ö' character
const v1 = variables({ töff: 'blue' }); // ❌ Error

// Set custom pattern allowing a few accented letters.
const v2opts: VariableOptions = { nameRe: /^[a-z0-9_-áðéíóúýþæö]+$/i };
const v2 = variables({ töff: 'blue' }, v2opts); // ✅ OK
```

**`VariableOptions.toCSSName?: (name: string) => string `**

```ts
const v3opts: VariableOptions = {
  toCSSName: (name) => name.replace(/_/g, '-'),
};
const v3 = variables({ link__color: 'blue' }, v3opts);

v3.declarations; // `--link--color: blue;\n`
v3.vars.link__color(); // `var(--link--color)`
```

## Compilation API

The `js-in-css` package exposes a CLI script of the same name. (Use `yarn run`
or `npm exec` to run it, unless you have `./node_modules/.bin/` in PATH, or
js-in-css is installed "globally".)

The `js-in-css` compiler imports/requires the default string export of the
passed javascript modules and passes it through a series of `postcss` plugins
before writing the resulting CSS to disc.

### CLI Syntax

```sh
js-in-css "inputglob" --outbase=src/path --outdir=out/path --minify
```

**`inputglob`**

Must be quoted. Handles all the patterns supported by the
[`glob` module](https://www.npmjs.com/package/glob).

**`--outdir`**

By default the compiled CSS files are saved in the same folder as the source
file. This is rarely the desired behavior so by setting `outdir` you choose
where the compiled CSS files end up.

The output file names replace the input-modules file-extension with `.css` —
unless if the source file name ends in `.css.js`, in which case the `.js`
ending is simply dropped.

**`--outbase`**

If your inputglob file list contains multiple entry points in separate
directories, the directory structure will be replicated into the `outdir`
starting from the lowest common ancestor directory among all input entry point
paths.

If you want to customize this behavior, you should set the `outbase` path.

**`--minify`**

Opts into moderately aggressive, yet safe [cssnano](https://cssnano.co/)
minification of the resulting CSS.

All comments are stripped, except ones that start with `/*!`.

### CLI Example Usage

```sh
js-in-css "src/css/**/*.js" --outdir=dist/styles
```

Given the `src` folder contained the following files:

```
src/css/styles.css.js
src/css/resets.js
src/css/component/buttons.css.js
src/css/component/formFields.js
```

The dist folder now contains:

```
dist/styles/styles.css
dist/styles/resets.css
dist/styles/component/buttons.css
dist/styles/component/formFields.css
```

Note how the `src/css/` is automatically detected as a reasonable common
ancestor. If you want to make `src/` the base folder, you must use the
`outbase` option, like so:

```sh
js-in-css "src/css/**/*.js" --outbase=src --outdir=dist
```

The dist folder now contains:

```
dist/styles/css/styles.css
dist/styles/css/resets.css
dist/styles/css/component/buttons.css
dist/styles/css/component/formFields.css
```

## Roadmap

- Add Color helpers for parsing, converting, adjusting, etc.
- Expose a JavaScript build API with slightly more configurability

### Maybe:

- Add more helper utilities (ideas?)
- `--watch` mode … may be out of scope
- Ability to add more postcss plugins and more fine-grained plugin
  configurability.

### Not planned:

- Emitting source maps.
- Complicated config files, etc.
