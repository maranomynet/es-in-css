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
  - [Color Helper](#color-helper)
  - [`variables` Helper](#variables-helper)
    - [`VariableStyles.declarations`](#variablestylesdeclarations)
    - [`VariableStyles.vars`](#variablestylesvars)
    - [`VariableStyles.override`](#variablestylesoverride)
    - [`variables.join` Composition Helper](#variablesjoin-composition-helper)
    - [`VariableOptions`](#variableoptions)
- [Compilation API](#compilation-api)
  - [CLI Syntax](#cli-syntax)
    - [CLI Example Usage](#cli-example-usage)
  - [JS API](#js-api)
    - [`compileCSS` (from files)](#compilecss-from-files)
    - [`compileCSSFromJS`](#compilecssfromjs)
- [Roadmap](#roadmap)

<!-- prettier-ignore-end -->

## Quick-Start Guide

```sh
yarn add --dev es-in-css
```

Create a file called `src/cool-design.css.js`:

```ts
import { css, variables, px } from 'es-in-css';

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
yarn run es-in-css "src/*.css.js" --outdir=dist/styles
```

or using npm:

```sh
npm exec es-in-css "src/*.css.js" --outdir=dist/styles
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

The `es-in-css` module exports the following methods:

### `css` Templater

**Syntax:** <code>css\`...`: string</code>

Dumb tagged template literal that returns a `string`. Mostly it guarantees
nice syntax highlighting and code-completion in VSCode by using a well-known
name.

```ts
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

### `scoped` Name Generator

**Syntax:** `scoped(prefix?: string): string`

Returns a randomized/unique string token, with an optional `prefix`. These
tokens can be using for naming `@keyframes` or for mangled class-names, if
that's what you need:

```ts
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

```ts
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

### Color Helper

`es-in-css` bundles the [`color` package](https://www.npmjs.com/package/color)
and simply exposes it as `color`.

```ts
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

```ts
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

### `variables` Helper

**Syntax:**
`variables<T extends string>(vars: Record<T, VariableValue>, options?: VariableOptions): VariableStyles<T>`

Helper to provide type-safety and code-completion when using CSS custom
properties (CSS variables) at scale.

```ts
import { variables, css } from 'es-in-css';

const cssVars = variables({
  linkColor: `#0000cc`,
  linkColor__hover: `#cc00cc`,
});
```

The returned objects contains the following:

#### `VariableStyles.declarations`

**Syntax:** `VariableStyles<T>.declarations: string`

Is a CSS string with all the custom property declarations, ready to be dumped
into a CSS rule block.

```ts
cssCars.declarations;
/*`
  --linkColor: #0000cc;
  --linkColor__hover: #cc00cc;
`*/
```

**NOTE:** This property is mutable, and appending `@media` queries and other
tweaks is often a good idea:

```ts
cssCars.declarations += css`
  @media (prefers-color-scheme: dark) {
    ${cssCars.override({
      linkColor: `#9999ff`,
      linkColor__hover: `#ff99ff`,
    })}
  }
`;
```

#### `VariableStyles.vars`

**Syntax:** `VariableStyles<T>.vars: Record<T, VariablePrinter>`

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

`VariablePrinter`s also have a `type` property that describes the original
input value when this CSS variable was declared.

```ts
const typeTest = variables({
  z1: 0,
  z2: '-0',
  n1: 123,
  n2: '1.23',
  p: '50%',
  s1: px(123),
  s2: rem(1.5),
  s3: '-2em',
  t1: ms(500),
  t2: '200ms',
  a: deg(90),
  c1: color('blue'),
  c2: '#ff0000ff',
  c3: 'rgba(123, 0, 0, .9)',
  u: `0 ${px(123)}`,
});
const tVars = typeTest.vars;

tVars.z1.type === 'zero';
tVars.z1.type === 'zero';
tVars.n1.type === 'number';
tVars.n2.type === 'number';
tVars.p.type === 'percent';
tVars.s2.type === 'size:rem';
tVars.s3.type === 'size:em';
tVars.t1.type === 'time:ms';
tVars.t2.type === 'time:ms';
tVars.a.type === 'angle:deg';
tVars.c1.type === 'color';
tVars.c2.type === 'color';
tVars.c3.type === 'color';
tVars.u.type === 'unknown';
```

_**NOTE:** This type information can be used for introspection, but may not
reflect the actual resolved type of the CSS variable because … The Cascade._

#### `VariableStyles.override`

**Syntax:** `VariableStyles<T>.override(vars: { [P in T]?: string }): string`

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

#### `variables.join` Composition Helper

**Syntax:**
`variables.join(...varDatas: Array<VariableStyles>): VariableStyles`

This helper combines the variable values and declarations from multiple
`VariableStyles` objects into a new, larger `VariableStyles` object.

#### `VariableOptions`

By default only "simple" ascii alphanumerical variable-names are allowed
(`/^[a-z0-9_-]+$/i`). If unsuppored/malformed variables names are passed, the
function throws an error. However, you can author your own `RegExp` to
validate the variable names, and a custom CSS variable-name mapper:

**`VariableOptions.nameRe?: RegExp`**

Custom name validation RegExp, for if you want/need to allow names more
complex than the default setting allows.

(Default: `/^[a-z0-9_-]+$/i`)

```ts
// Default behaviour rejects the 'ö' character
const v1 = variables({ töff: 'blue' }); // ❌ Error

// Set custom pattern allowing a few accented letters.
const v2opts: VariableOptions = { nameRe: /^[a-z0-9_-áðéíóúýþæö]+$/i };
const v2 = variables({ töff: 'blue' }, v2opts); // ✅ OK
```

**`VariableOptions.toCSSName?: (name: string) => string`**

Maps weird/wonky JavaScript property names to CSS-friendly css custom property
names.

(Default: `(name) => name`)

```ts
const v3opts: VariableOptions = {
  toCSSName: (name) => name.replace(/_/g, '-'),
};
const v3 = variables({ link__color: 'blue' }, v3opts);

v3.declarations; // `--link--color: blue;\n`
v3.vars.link__color(); // `var(--link--color)`
```

**`VariableOptions.resolvetype?: (value: unknown) => string | undefined`**

Runs ahead of the default type-resolution to detect custom types.

If a falsy type name is returned, the default type resolver continues running
as normal.

**`VariableOptions.isColor?: (value: unknown) => boolean`**

Use this option if you're using a custom color manipulation library.

Runs **after** the default color-detection logic, so it does not need to check
for common CSS color string formats.

Example: `(value) => value instance of MyColorClass`

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
      import { baseColor } from './styles.css';
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
