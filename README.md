# es-in-css

This library serves much of the same purpose as SASS/SCSS, LESS and other CSS
preprocessors, but uses plain JavaScript/TypeScript to provide type-safety and
"programmability" with local variables, mixins, utility functions, etc. etc.

Overall this is a "do less" toolkit with tiny API, that mainly tries to stay
out of your way.

SCSS-like [selector nesting][postcss-nested], inline
[`// comments` support](https://github.com/postcss/postcss-scss#2-inline-comments-for-postcss)
and [autoprefixer](https://www.npmjs.com/package/autoprefixer) features are
automatically provided by `postCSS`, but apart from that it's all pretty
basic. Just you composing CSS.

For good developer experience, use VSCode and install the official
[**vscode-styled-components** extension][vscode-styled-components]. That gives
you instant syntax highlighting and IntelliSense autocompletion inside
` css``  ` template literals, and maybe add a few
[helpful "snippets"](#helpful-vscode-snippets).

See also the chapter
[Why es-in-css Instead of SASS?](#why-es-in-css-instead-of-sass) below.

---

**Table of Contents:**

<!-- prettier-ignore-start -->
- [Quick-Start Guide](#quick-start-guide)
- [CSS Authoring Features](#css-authoring-features)
  - [`css` Templater](#css-templater)
  - [`cssVal` Templater](#cssval-templater)
  - [`str` Quoted String Printer](#str-quoted-string-printer)
  - [`scoped` Name Generator](#scoped-name-generator)
  - [Unit Value Helpers](#unit-value-helpers)
  - [`unitVal` Helper](#unitval-helper)
  - [Unit Value Types](#unit-value-types)
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
    - [`compileCSSString`](#compilecssstring)
- [Why es-in-css Instead of SASS?](#why-es-in-css-instead-of-sass)
- [Helpful VSCode Snippets](#helpful-vscode-snippets)
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

---

## CSS Authoring Features

The `es-in-css` module exports the following methods:

### `css` Templater

**Syntax:** <code>css\`...`: string</code>

Dumb(-ish) tagged template literal that returns a `string`. It provides nice
syntax highlighting and code-completion in VSCode by using a well-known name.

Example of use:

```js
import { css } from 'es-in-css';

const themeColors = {
  yellow: `yellow`,
  red: `#cc3300`,
  purple: `#990099`,
};
const textColor = `#333`;

const boxStyle = () => css`
  background: #f4f4f4;
  border: 1px solid #999;
  border-radius: 3px;
  padding: 12px;
`;

export default css`
  body {
    color: ${textColor};
    ${boxStyle};
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

Depsite being quite "dumb" it does have some convenience features:

- It filter away/suppresses "falsy" values (except `0`) similar to how React
  behaves.
- Arrays are falsy-filtered and then auto-joined with `", "`.
- Bare functions are invoked without any arguments.

All other values are cast to string as is.

### `cssVal` Templater

**Syntax:** Same as [`css` Templater](#css-templater)

An alias for the ` css`` ` templater, for cases where you're writing a
standalone CSS value or other out-of-context CSS snippets, and you wish to
disable VSCode's syntax highlighting and error checking.

### `str` Quoted String Printer

**Syntax:** `str(value: string): string`

Helper to convert a value to a quoted string.

Example:

```js
import { str, css } from 'es-in-css';

const message = 'Warning "Bob"!';

export default css`
  .foo::before {
    content: ${str(message)};
  }
`;

// Outputs:
//
// .foo::before {
//   content: "Warning \"Bob\"!";
// }
```

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

// Outputs:
//
// .Button_4af51c0d267 {
//   border: 1px solid blue;
// }
// .Button_4af51c0d267__title {
//   font-size: 2rem;
// }
```

### Unit Value Helpers

**Fixed/Physical sizes:** `px()` and `cm()`

**Font relative:** `em()`, `rem()`, `ch()` and `ex()`

**Layout relative:** `pct()` (%), `vh()`, `vw()`, `vmin()` and `vmax()`

**Time:** `ms()`

**Angle:** `deg()`

These return light-weight `UnitValue` instances that can behave as either
string **or** number literals, depending on the context.

(See [the `unitVal` helper](#unitval-helper) for more info)

```js
import { px, css } from 'es-in-css';

const leftColW = px(300);
const mainColW = px(700);
const gutter = px(50);
// Calculations work as if they're numbers
const totalWidth = px(leftColW + gutter + mainColW);

export default css`
  .layout {
    /* Unit suffix appears when printed. */
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

// .layout {
//   /* Unit suffix appears when printed. */
//   width: 1050px;
//   margin: 0 auto;
//   display: flex;
//   gap: 50px;
// }
// .main {
//   width: 700px;
// }
// .sidebar {
//   width: 300px;
// }
```

### `unitVal` Helper

**Syntax:**
`unitVal<U extends string>(value: number | UnitValue<U>, unit: U): UnitValue<U> & number`

Creates a custom `UnitValue` instance that is also `number`-compatible (see
[Unit Value Types](#unit-value-types) for more info)

```js
import { unitVal, px } from 'es-in-css';

// These are the same
const valA = /** @type {number & UnitValue<'px'>} */ unitVal(10, 'px');
const valB = /** @type {number & UnitValue<'px'>} */ px(10);

// Both have `.value` and `.unit`
valA.value === 10; // true
valA.unit === 'px'; // true
valB.value === 10; // true
valB.unit === 'px'; // true

// Both string-print with the unit attached
`${valA}` === '10px'; // true
`${valB}` === '10px'; // true

// Both behave as numbers
valA * 2 === 20; // true;
valB * 2 === 20; // true;

// And are assignable to numbers
const numA = /** @type {number} */ valA;
const numB = /** @type {number} */ valB;

// And behave like numbers
const minVal = Math.min(valA, valB);
// ...except under close scrutiny
typeof valB === 'number'; // ❌ false
```

### Unit Value Types

The [unit value helpers](#unit-value-helpers) emit the following `UnitValue`
sub-types:

`PxValue`, `RemValue`, `EmValue`, `ChValue`, `ExValue`, `PctValue`, `VwValue`,
`VhValue`, `VminValue`, `VmaxValue`, `MsValue`, `CmValue`, `DegValue`

All of these unit types are also typed as a `number`, to tell TypeScript that
the values are safe to use in calculations. (They are safe because they have a
number-returning `.valueOf()` method.)

**NOTE:** This white "lie" about the `number` type may cause problems at
runtime if these "UnitNumbers" end up in situations where
`typeof x === "number"` is used to validate a literal number value.  
However, the risk vs. benefit trade-off seems reasonable.

For cases that require an actual non-unit, plain `number` value, you can use
the `PlainNumber` type. Example:

```ts
import { PlainNumber, PxValue, rem } from 'es-in-css';

/** Converts a pixel size to a rem value. */
export const pxRem = (px: PlainNumber | PxValue) => rem(px / 16);
```

Additionally, there are helpful categorized union types:

- `LayoutRelativeValue` – all container proportional units: `%`, `vw`, etc.
- `FontRelativeValue` – all text proportional units: `em`, `rem`, etc.
- `LengthValue` – all fixed/physical units (`px`, `cm`), plus the above
  unions.

### Unit Converters

To keep it simple and sane `es-in-css` only **supports** one `UnitValue` type
per category of units (time, angles, physical size, etc.) but provides
friendly converter functions from other units of measure into the main
supported units.

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

**Syntax:**
`unitOf<U extends string>(value: number | UnitValue<U>): U | undefined`

Checks if its given argument is a `UnitValue` instance and returns its `.unit`
property.

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
and re-exports it as `color`.

The color class/function creates `ColorValue` instances that can be used in
CSS, but also come with useful manipulation mhethods.

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

// div {
//   color: rgb(255, 0, 0);
//   background-color: hsla(0, 50%, 50%, 0.2);
// }
```

It extends `color` by adding a static `fromName` method to generate a
type-safe color-name to `ColorValue` mapper:

```js
const prettyColor = color.fromName('lime');
// is just a alias for
const prettyColor2 = color('lime');

// but adds type-safety that the base method lacks:
const notAColor2 = color('bogus'); // ❌ Type-checks but throws at runtime
const notAColor = color.fromName('bogus'); // Type Error
//                               ^^^^^^^
```

It also exports `rgb()` and `hsl()` which are simple aliases of the `color`
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

See [`VariableOptions`](#variableoptions) below for configuration options.

```js
import { makeVariables, css } from 'es-in-css';

const myVarNames = ['linkColor', 'linkColor__hover'];

const cssVars = makeVariables(myVarNames);
```

The returned `VariableStyles` object contains the following properties:

- `VariableStyles.vars.*` — pre-declared CSS value printers (outputting
  `var(--*)` strings)
- `VariableStyles.declare(…)` — for declaring initial values for all of the
  variables.
- `VariableStyles.override(…)` — for re-declaraing parts of the variable
  collection.

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

vars.linkColor.or(`black`); // pass "black" as fallback value
// `var(--linkColor, black)`

`color: ${vars.linkColor__hover};`;
// `color: var(--linkColor__hover);`
```

`VariablePrinter` objects also have a `cssName` property with the raw
(unwrapped) name of the variable, like so:

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

// :root {
//   --linkColor: #0000cc,
//   --linkColor__hover: #cc00cc,
// }
```

#### `VariableStyles.override`

**Syntax:**
`VariableStyles<T>.override(vars: Partial<Record<T, string >>): string`

Similar to the `.declare()` method, but can be used to re-declare (i.e.
override) only some of of the CSS variables `T`. Again, property names not
matching `T` are ignored/dropped.

Furthermore, values of `null`, `undefined`, `false` are interpreted as
"missing", and the property is ignored/dropped.

```js
css`
  @media (prefers-color-scheme: dark) {
    :root {
      ${cssVars.override({
        linkColor: `#9999ff`,
        unknown_variable: `#transparent`, // ignored/dropped
        linkColor__hover: false, // ignored/dropped
      })}
    }
  }
`;

// @media (prefers-color-scheme: dark) {
//   :root{
//     --linkColor: #9999ff;
//   }
// }
```

#### `makeVariables.join` Composition Helper

**Syntax:**
`makeVariables.join(...varDatas: Array<VariableStyles>): VariableStyles`

This helper combines the variable values and declaration methods from multiple
`VariableStyles` objects into a new, larger `VariableStyles` object.

```js
const colorVariables = makeVariables(['primary', 'secondary', 'link'], {
  namespace: 'color-',
});
const fontVariables = makeVariables(['heading', 'normal', 'smallprint'], {
  namespace: 'font-',
});

const allVariables = makeVariables.join(colorVariables, fontVariables);

css`
  p {
    color: ${allVariables.vars.primary};
    font: ${allVariables.vars.normal};
  }
`;

// p {
//   color: var(--color-primary);
//   font: var(--font-normal);
// }
```

#### `makeVariables.isVar` Helper

**Syntax:** `makeVariables.isVar(value: unknown): value is VariablePrinter`

A helper that checks if an input value is of type `VariablePrinter`.

```js
import { makeVariables } from 'es-in-css';

makeVariables.isVar(cssVars.vars.linkColor); // ✅ true
// None of these are `VariablePrinter` objects:
makeVariables.isVar('var(--linkColor)'); // ❌ false
makeVariables.isVar('' + cssVars.vars.linkColor); // ❌ false
makeVariables.isVar(cssVars); // ❌ false
```

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
const var1 = makeVariables(['töff']); // ❌ Error

// Set custom pattern allowing a few accented letters.
const var2opts: VariableOptions = { nameRe: /^[a-z0-9_-áðéíóúýþæö]+$/i };
const var2 = makeVariables(['töff'], var2opts); // ✅ OK

var2.vars.töff + ''; // `var(--töff)`
```

**`VariableOptions.toCSSName?: (name: string) => string`**

Maps weird/wonky JavaScript property names to CSS-friendly css custom property
names.

(Default: `(name) => name`)

```js
const var3opts: VariableOptions = {
  // convert all "_" to "-"
  toCSSName: (name) => name.replace(/_/g, '-'),
};
const var3 = makeVariables(['link__color'], var3opts);

var3.declare({ link__color: 'blue' }); // `--link--color: blue;\n`
var3.vars.link__color + ''; // `var(--link--color)`
```

**`VariableOptions.namespace?: string`**

Prefix that gets added to all CSS printed variable names.

The namespace is neither validated nor transformed in any way, except that
spaces and other invalid characters are silently stripped away.

```js
const var4opts: VariableOptions = {
  // NOTE: The "{" and "}" will get silently stripped
  namespace: ' ZU{U}PER-',
};
const var4 = makeVariables(['link__color'], var4opts);

var4.declare({ link__color: 'blue' }); // `--ZUUPER-link--color: blue;\n`
var4.vars.link__color + ''; // `var(--ZUUPER-link--color)`
```

---

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

**`-n, --no-nested`**

Disables the SCSS-like selector nesting behavior provided by the
[postcss-nested][] plugin.

(To pass custom options to the plugin, use the [JavaScript API](#js-api).)

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

- `write?: boolean` — (Default: `true`) Allows turning off the automatic
  writing to disc, if you want to post-process the files and handle the FS
  writes manually.  
  When turned off the CSS content is returned as part of the promise payload.
- `redirect?: (outFile: string, inFile: string) => string | undefined` —
  Dynamically changes the final destination of the output files. (Values that
  lead to overwriting the source file are ignored.)
- `banner?: string` — Text that's prepended to every output file.
- `footer?: string` — Text that's appended to every output file.
- `ext?: string | (inFile: string) => string | undefined` — The function
  signature allows dynamically choosing a file-extension for the output files.
- `nesting?: boolean | import('postcss-nesting').Options` — (Default: `true`)
  Allows turning off the SCSS-like selector nesting behavior provided by
  [postcss-nested](https://www.npmjs.com/package/postcss-nested) or passing it
  custom options.

#### `compileCSS` (from files)

Works in pretty much the same way as the CLI.

Takes a list of files to read, and returns an Array of result objects each
containing the compiled CSS and the resolved output file path.

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

Compiles CSS from a JavaScript source string. This may be the preferable
method when working with bundlers such as `esbuild`.

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

compileCSSFromJS(scriptStrings, {
  outbase: 'src',
  outdir: 'dist',
  // ext: '.css',
  // minify: false,
  // prettify: false,
  // redirect: (outFile, inFile) => outFile + '_',
  write: false,
}).then((result) => {
  console.log(result.inFile); // string
  writeFile(result.outFile, result.css);
});
```

#### `compileCSSString`

Lower-level method that accepts a raw, optionally nested, CSS string (or an
array of such strings) and returns a compiled CSS string (or array) —
optionally minified or prettified.

```js
const { compileCSSString } = require('es-in-js/compiler');

const rawCSS = `
  // My double-slash comment
  body { 
    p { color: red; 
      > span { border:none }
    } 
  }
`;

compileCSSString(rawCSS, {
  prettify: true,
  // outdir: 'dist', // Used for auto-resolving .prettierrc
  // minify: false,
  // nesting: true,
  // banner: '',
  footer: '/* The "footer" is appended as is */',
}).then((outCSS) => {
  console.log(outCSS);
  // /* My double-slash comment *​/
  // body p {
  //   color: red;
  // }
  // body p > span {
  //   border: none;
  // }
  // /* The "footer" is appended as is *​/
});
```

---

## Why es-in-css Instead of SASS?

**TL;DR:** JavaScript/TypeScript provides better developer ergonomics than
SASS, and is a more future-proof technology.

SASS has been almost an industry standard tool for templating CSS code for
well over a decade now. Yet it provides poor developer experience with
lackluster editor integrations, idiosyncratic syntax, extremely limited
feature set, publishing and consuming libraries is hard, etc…

Over the past few years, the web development community has been gradually
moving on to other, more nimble technologies — either more vanilla "text/css"
authoring, or class-name-based reverse compilers like Tailwind, or various
CSS-in-JS solutions.

This package provides supportive tooling for this last group, but offers also
a new lightweight alternative: To author CSS using JavaScript as a templating
engine, and then output it via one of the following methods:

- `writeFile` the resulting string to static file
- Use an [es-to-css compiler](#compilation-api),
- Stream it directly to the browser,
- Use some build tool "magic" (e.g. write a custom Webpack loader)

---

## Helpful VSCode Snippets

Here are a few code "snippets" you can
[add to your global snippets file](https://code.visualstudio.com/docs/editor/userdefinedsnippets#_create-your-own-snippets)
to help you use es-in-css a bit faster:

```jsonc
  "Insert ${} variable print block": {
    "scope": "javascript,javascriptreact,typescript,typescriptreact,css",
    "prefix": "v",
    "body": "\\${$0}",
  },
  "css`` tagged template literal": {
    "scope": "javascript,javascriptreact,typescript,typescriptreact",
    "prefix": "css",
    "body": "css`\n\t$0\n`",
  },
  "cssVal`` tagged template literal": {
    "scope": "javascript,typescript,typescriptreact",
    "prefix": "cssVal",
    "body": "cssVal`\n\t$0\n`",
  },
  "New *.css.js file": {
    "scope": "javascript,typescript",
    "prefix": "css-js-file",
    "body": [
      "import { css } from 'es-in-css';",
      "",
      "export default css`\n\t$0\n`"],
  },
```

Also make sure you install the official [**vscode-styled-components**
extension][vscode-styled-components] for fancy syntax highlighting and
IntelliSense autocompletion inside ` css``  ` template literals

---

## Roadmap

- Loaders/config for Webpack, esbuild, Next.js builds, etc. (**Help wanted!**)

**Maybes:**

- Add more CSS authoring helpers/utilities (ideas/PRs welcome)
- In-built `--watch` mode (may be out of scope?)
- Ability to add more postcss plugins and more fine-grained plugin
  configurability.
- Compilation directly from TypeScript

**Not planned:**

- Emitting source maps.
- Complicated config files, etc.

## Changelog

See [CHANGELOG.md](CHANGELOG.md)

<!-- Links: -->

[vscode-styled-components]:
  https://marketplace.visualstudio.com/items?itemName=styled-components.vscode-styled-components
[postcss-nested]: https://www.npmjs.com/package/postcss-nested
