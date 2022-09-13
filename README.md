# es-in-css

This library serves much of the same purpose as SASS/SCSS, LESS and other CSS
preprocessors, but uses plain JavaScript/TypeScript to provide the
"programmability" of local variables, mixins, utility functions, etc. etc.

Overall this is a "do less" toolkit with tiny API, that mainly tries to stay
out of your way.

SCSS-like [selector nesting](https://www.npmjs.com/package/postcss-nested),
inline
[`// comments` support](https://github.com/postcss/postcss-scss#2-inline-comments-for-postcss)
and [autoprefixer](https://www.npmjs.com/package/autoprefixer) features are
automatically provided by `postCSS`, but apart from that it's all pretty
basic. Just you composing CSS.

For good developer experience, use VSCode and install the official
[**vscode-styled-components** extension](https://marketplace.visualstudio.com/items?itemName=styled-components.vscode-styled-components).
That gives you instant syntax highlighting and IntelliSense autocompletion
inside ` css``  ` template literals.

**Table of Contents:**

<!-- prettier-ignore-start -->
- [Quick-Start Guide](#quick-start-guide)
- [CSS Authoring Features](#css-authoring-features)
  - [`css` Templater](#css-templater)
  - [`media` @media Nesting Helper](#media-media-nesting-helper)
  - [`scoped` Name Generator](#scoped-name-generator)
  - [Unit Value Helpers](#unit-value-helpers)
  - [Unit Converters](#unit-converters)
  - [`unitOf` Helper](#unitof-helper)
  - [Color Helper](#color-helper)
  - [`makeVariables` Helper](#makevariables-helper)
    - [`VariableStyles.vars`](#variablestylesvars)
    - [`VariableStyles.declare`](#variablestylesdeclare)
    - [`VariableStyles.override`](#variablestylesoverride)
    - [`makeVariables.join` Composition Helper](#makevariablesjoin-composition-helper)
    - [`makeVariables.isVar` Helper](#makevariablesisvar-helper)
    - [`VariableOptions`](#variableoptions)
- [Compilation API](#compilation-api)
  - [CLI Syntax](#cli-syntax)
    - [CLI Example Usage](#cli-example-usage)
  - [JS API](#js-api)
    - [`compileCSS` (from files)](#compilecss-from-files)
    - [`compileCSSFromJS`](#compilecssfromjs)
- [Roadmap](#roadmap)
- [Changelog](#changelog)

<!-- prettier-ignore-end -->

## Quick-Start Guide

```sh
yarn add --dev es-in-css
```

Create a file called `src/cool-design.css.js`:

```js
import { css, makeVariables, px } from 'es-in-css';

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

const cssVars = makeVariables([
  'linkColor',
  'linkColor--hover',
  'linkColor__focus',
  'focusColor',
]);
const vars = cssVars.vars;

export default css`
  :root {
    ${cssVars.declare({
      linkColor: colors.red,
      'linkColor--hover': colors.purple, // dashes must be quoted
      linkColor__focus: var.focusColor, // aliased
      focusColor: `peach`,
    })}
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
yarn run es-in-css "src/*.css.js" --outdir=dist/styles
```

or using npm:

```sh
npm exec es-in-css "src/*.css.js" --outdir=dist/styles
```

You now have a file called `dist/styles/cool-design.css`:

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

The `es-in-css` module exports the following methods:

### `css` Templater

**Syntax:** <code>css\`...`: string</code>

Dumb tagged template literal that returns a `string`. Mostly it guarantees
nice syntax highlighting and code-completion in VSCode by using a well-known
name.

```js
import { css } from 'es-in-css';

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

### `media` @media Nesting Helper

**Syntax:**

- `media(mediaQuery: string, cssContent: string): string`
- `media(mediaQuery: string): ((cssContent: string) => string)`

This mixin (nesting helper) wraps its `cssContent` in a `@media` block,
wrapped in an `@at-root` directive, which instructs the `es-in-css`' compiler
to break out of any enclosing `@media` blocks.

(See
[SCSS' documentation for `@at-root`](https://sass-lang.com/documentation/at-rules/at-root#beyond-style-rules).)

_**NOTE:** This helper only makes sense if you're either using the
[CSS compilation API](#compilation-api), or sending the result through a SCSS
compiler._

```js
import { media, css } from 'es-in-css';

export default css`
  @media (max-width: 699px) {
    p {
      color: blue;
      ${media(
        '(min-width: 700px)',
        css`
          color: red;
        `
      )}
    }
  }
`;
/* Raw output:

  @media (max-width: 699px) {
    p {
      color: blue;
      @at-root (without: media) {
        @media (min-width: 700px) {
          color: red;
        }
      }
    }
  }
*/

/* CLI/SCSS compiled output:

  @media (max-width: 699px) {
    p {
      color: blue;
    }
  }
  @media (min-width: 700px) {
    p {
      color: red;
    }
  }
*/
```

If `media` is called with a single argument (i.e. `media(mediaQuery)`), it
returns a curried, reusable function which takes `cssContent` as its only
argument.

<!-- prettier-ignore-start -->

```js
const media = {
  small: media('(max-width: 699px)'),
  medium: media('(min-width: 700px) and (max-width: 999px)'),
  large: media('(min-width: 1000px)'),
};

export default css`
  @media (max-width: 699px) {
    p { color: blue; }
    ${media.large(css`p { color: red; }`)}
  }
`;
```

<!-- prettier-ignore-end -->

### `scoped` Name Generator

**Syntax:** `scoped(prefix?: string): string`

Returns a randomized/unique string token, with an optional `prefix`. These
tokens can be using for naming `@keyframes` or for mangled class-names, if
that's what you need:

```js
import { scoped, css } from 'es-in-css';

export const blockName = scoped(`Button`); // 'Button_4af51c0d267'

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

**Angle:** `deg()`

These return light-weight object instances that can still be mostly treated as
string **and** number liters depending on the context.

```js
import { px, css } from 'es-in-css';

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

Percentage values from proportions/fractions:  
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

Degrees from other angle units:  
`deg_turn()`, `deg_rad()`, `deg_grad()`,

```js
deg_turn(0.75); // 270deg
deg_rad(-Math.PI); // -180deg
```

### `unitOf` Helper

**Syntax:** `unitOf(value: number | UnitValue): string | undefined`

Checks if its given argument is a `UnitValue` instance and returns its unit
string.

```js
import { unitOf } from 'es-in-css';

unitOf(px(10)); // 'px'
unitOf(ms_sec(1)); // 'ms'
```

Returns `undefined` otherwise.

```js
unitOf(10); // undefined
unitOf('10px'); // undefined
```

### Color Helper

`es-in-css` bundles the [`color` package](https://www.npmjs.com/package/color)
and simply exposes it as `color`.

```js
import { color, css } from 'es-in-css';

const c1 = color('red');
const c2 = c1.fade(0.8).desaturate(0.5);

export default css`
  div {
    color: ${c1};
    background-color: ${c2};
  }
`;
/*`
  div {
    color: rgb(255, 0, 0);
    background-color: hsla(0, 50%, 50%, 0.2);
  }
`*/
```

It also exports `rgb()` and `hsl()` which are simply aliases of the `color`
package's static class methods of the same names.

```js
import { rgb, hsl, color } from 'es-in-css';

const rgbRed = rgb(255, 0, 0);
const hslRed = hsl(0, 100, 50);
// With alpha channel
const rgbRedFaded = rgb(255, 0, 0, 0.5);
const hslRedFaded = hsl(0, 100, 50, 0.5);

rgb === color.rgb; // true
hsl === color.hsl; // true
```

Feel free to import your own color helper library, and use it instead.

### `makeVariables` Helper

**Syntax:**
`makeVariables<T extends string>(variableTokens: Array<T>, options?: VariableOptions): VariableStyles<T>`

Helper to provide type-safety and code-completion when using CSS custom
properties (CSS variables) at scale.

```js
import { makeVariables, css } from 'es-in-css';

const cssVars = makeVariables(['linkColor', 'linkColor__hover']);
```

The returned objects contains the following:

#### `VariableStyles.vars`

**Syntax:** `VariableStyles<T>.vars: Record<T, VariablePrinter>`

Holds a readonly `Record<T, VariablePrinter>` object where the
`VariablePrinter`s emit the CSS variable names wrapped in `var()`, ready to be
used as CSS values … with the option of passing a default/fallback value via
the `.or() method`.

```js
const { vars } = cssVars;

vars.linkColor + ''; // invokes .toString()
// `var(--linkColor)`

vars.linkColor.or(`black`); // pass fallback value
// `var(--linkColor, black)`

`color: ${vars.linkColor__hover};`;
// `color: var(--linkColor__hover);`
```

`VariablePrinter` objects have a `cssName` property with the bare (unwrapped)
name of the variable, like so:

```js
vars.linkColor.cssName;
// `"--linkColor"`
```

#### `VariableStyles.declare`

**Syntax:** `VariableStyles<T>.declare(vars: Record<T, string >): string`

Lets you type-safely write values for **all** the defined CSS variables into a
CSS rule block. Property names not matching `T` are dropped/ignored.

```js
css`
  :root {
    ${cssVars.declare({
      linkColor: `#0000cc`,
      linkColor__hover: `#cc00cc`,
      unknown_variable: `transparent`, // ignored/dropped
    })}
  }
`;
/*`
  :root {
    --linkColor: #0000cc,
    --linkColor__hover: #cc00cc,
  }
`*/
```

#### `VariableStyles.override`

**Syntax:**
`VariableStyles<T>.override(vars: Partial<Record<T, string >>): string`

Similar to the `.declare()` method, but can be used to re-declare (i.e.
override) only some of of the CSS variables `T`. Again, property names not
matching `T` are dropped/ignored.

```js
css`
  @media (prefers-color-scheme: dark) {
    :root {
      ${cssVars.override({
        linkColor: `#9999ff`,
        unknown_variable: `#transparent`, // ignored/dropped
      })}
    }
  }
`;
/*`
  @media (prefers-color-scheme: dark) {
    :root{
      --linkColor: #9999ff;
    }
  }
`*/
```

#### `makeVariables.join` Composition Helper

**Syntax:**
`makeVariables.join(...varDatas: Array<VariableStyles>): VariableStyles`

This helper combines the variable values and declaration methods from multiple
`VariableStyles` objects into a new, larger `VariableStyles` object.

#### `makeVariables.isVar` Helper

**Syntax:** `makeVariables.isVar(value: unknown): value is VariablePrinter`

A helper that checks if an input value is of type `VariablePrinter`.

#### `VariableOptions`

By default only "simple" ascii alphanumerical variable-names are allowed
(`/^[a-z0-9_-]+$/i`). If unsuppored/malformed CSS variable names are passed,
the function throws an error. However, you can author your own `RegExp` to
validate the variable names, and a custom CSS variable-name mapper:

**`VariableOptions.nameRe?: RegExp`**

Custom name validation RegExp, for if you want/need to allow names more
complex than the default setting allows.

(Default: `/^[a-z0-9_-]+$/i`)

```js
// Default behaviour rejects the 'ö' character
const v1 = makeVariables(['töff']); // ❌ Error

// Set custom pattern allowing a few accented letters.
const v2opts: VariableOptions = { nameRe: /^[a-z0-9_-áðéíóúýþæö]+$/i };
const v2 = makeVariables(['töff'], v2opts); // ✅ OK
```

**`VariableOptions.toCSSName?: (name: string) => string`**

Maps weird/wonky JavaScript property names to CSS-friendly css custom property
names.

(Default: `(name) => name`)

```js
const v3opts: VariableOptions = {
  toCSSName: (name) => name.replace(/_/g, '-'),
};
const v3 = makeVariables(['link__color'], v3opts);

v3.declare({ link__color: 'blue' }); // `--link--color: blue;\n`
v3.vars.link__color(); // `var(--link--color)`
```

## Compilation API

The `es-in-css` compiler imports/requires the default string export of the
passed javascript modules and passes it through a series of `postcss` plugins
before writing the resulting CSS to disc.

### CLI Syntax

The `es-in-css` package exposes a CLI script of the same name. (Use `yarn run`
or `npm exec` to run it, unless you have `./node_modules/.bin/` in PATH, or
es-in-css is installed "globally".)

```sh
es-in-css "inputglob" --outbase=src/path --outdir=out/path --minify
```

**`inputglob`**

Must be quoted. Handles all the patterns supported by the
[`glob` module](https://www.npmjs.com/package/glob).

**`-d, --outdir <path>`**

By default the compiled CSS files are saved in the same folder as the source
file. This is rarely the desired behavior so by setting `outdir` you choose
where the compiled CSS files end up.

The output file names replace the input-modules file-extension with `.css` —
unless if the source file name ends in `.css.js`, in which case the `.js`
ending is simply dropped.

**`-b, --outbase <path>`**

If your inputglob file list contains multiple entry points in separate
directories, the directory structure will be replicated into the `outdir`
starting from the lowest common ancestor directory among all input entry point
paths.

If you want to customize this behavior, you should set the `outbase` path.

**`-e, --ext <file-extension>`**

Customize the file-extension of the output files. Default is `.css`

**`-m, --minify`**

Opts into moderately aggressive, yet safe [cssnano](https://cssnano.co/)
minification of the resulting CSS.

All comments are stripped, except ones that start with `/*!`.

**`-p, --prettify [configFilePath]`**

Runs the result CSS through Prettier. Accepts optional `configFilePath`, but
defaults to resolving `.prettierrc` for `--outdir` or the current directory.

Ignored if mixed with `--minify`.

#### CLI Example Usage

```sh
es-in-css "src/css/**/*.js" --outdir=dist/styles
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
es-in-css "src/css/**/*.js" --outbase=src --outdir=dist/styles
```

The dist folder now contains:

```
dist/styles/css/styles.css
dist/styles/css/resets.css
dist/styles/css/component/buttons.css
dist/styles/css/component/formFields.css
```

### JS API

The options for the JavaScript API are the same as for the CLI, with the
following additions:

- `write?: boolean` — (default: `true`) allows turning off the automatic
  writing to disc, if you want to post-process the files and handle the FS
  writes manually.  
  When turned off the CSS content is returned as part of the promise payload.
- `redirect?: (outFile: string, inFile: string) => string | undefined` — to
  dynamically change the final destination of the output files. (Values that
  lead to overwriting the source file are ignored.)
- `banner?: string` — text that's prepended to every output file.
- `footer?: string` — text that's appended to every output file.
- `ext?: string | (inFile: string) => string | undefined` — the function
  signature allows dynamically choosing a file-extension for the output files.

#### `compileCSS` (from files)

Works in pretty much the same way as the CLI.

```js
const { compileCSS } = require('es-in-js/compiler');
const { writeFile } = require('fs/promise');

const files = [
  'src/foo/styles.css.js',
  'src/foo/styles2.css.js',
]

compileCSS(sourceFiles, {
  outbase: 'src'
  outdir: 'dist'
  // ext: '.scss', // default: '.css'
  // ext: (inFile) => inFile.endsWith('.scss.js') ? 'scss' : 'css',
  // minify: false,
  // prettify: false,
  // redirect: (outFile, inFile) => outFile + '_',
  write: false,
}).then((result) => {
  console.log(result.inFile); // string
  writeFile(result.outFile, result.css);
});
```

#### `compileCSSFromJS`

This may be the preferable method when working with bundlers such as
`esbuild`.

(NOTE: This method temporarily writes the script contents to the file system
to allow imports and file-reads to work correctly, but then deletes those
files afterwards.)

```js
const { compileCSSFromJS } = require('es-in-js/compiler');
const { writeFile } = require('fs/promise');

const scriptStrings = [
  {
    fileName: '_temp/styles.css.mjs',
    content: `
      import { css } from 'es-in-css';
      export const baseColor = 'red';
      export default css\`
        body { color: \${baseColor}; }
      \`;
    `,
  },
  {
    fileName: '_temp/styles2.css.mjs',
    content: `
      import { css } from 'es-in-css';
      import { baseColor } from './styles.css.mjs';
      export default css\`
        div { color: \${baseColor}; }
      \`;
    `,
  },
];

compileCSSFromJS(scriptStrings,   outbase: 'src'
  outdir: 'dist'
  // ext: '.css',
  // minify: false,
  // prettify: false,
  // redirect: (outFile, inFile) => outFile + '_',
  write: false,
).then((result) => {
  console.log(result.inFile); // string
  writeFile(result.outFile, result.css);
});
```

## Roadmap

- Expose a JavaScript build API with slightly more configurability
- **Help wanted:** Loaders/config for Webpack, esbuild, Next.js builds, etc.

**Maybes:**

- Add more CSS authoring helpers/utilities (ideas? PRs welcome)
- In-built `--watch` mode … may be out of scope
- Ability to add more postcss plugins and more fine-grained plugin
  configurability.

**Not planned:**

- Emitting source maps.
- Complicated config files, etc.

## Changelog

See [CHANGELOG.md](CHANGELOG.md)
