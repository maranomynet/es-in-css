# Change Log for `es-in-css`

## Upcoming...

- ... <!-- Add new lines here. -->
- perf: Add `#__NO_SIDE_EFFECTS__` compiler notation to all exported functions

## 0.7.7

_2024-02-05_

- fix: Regression where `CompilerOptions.write` defaulted to `false`

## 0.7.6

_2024-02-02_

- feat: Clean up temp files when a `compileCSSFromJS` process exits mid-flight

## 0.7.3 – 0.7.5

_2024-01-11_

- feat: Add branded types `CssString`, `CssVarString`, `CssMediaQueryString`.
- Deprecate types:
  - feat: Deprecate type `RawCssValue` in favor of `CssString` or `string`
  - feat: Deprecate type `RawCssString` in favor of `CssString`
  - feat: Deprecate type `RawCssVarString` in favor of `CssVarString`
  - feat: Deprecate type `RawMediaQuery` in favor of `CssMediaQueryString`
- feat: Add `fr` unit helper (and `FrValue` type)
- docs: Fix outdated links to README in JSDoc comments

## 0.7.2

_2023-08-10_

- fix: Remove `css-prettier` package name alias, use plain `prettier` instead

## 0.7.0 – 0.7.1

_2023-04-24_

- **BREAKING** feat: `css` helper again auto-joins arrays with space

## 0.6.0

_2023-04-04_

- **BREAKING** feat: `css` helper now joins arrays with `, `, not just space

## 0.5.27

_2023-03-31_

- feat: Remove `amp()` helper. Future `postcss-nested` versions will throw

## 0.5.26

_2023-03-30_

- feat: Add temporary/experimental `amp()` helper as a workaround for
  `postcss-nested` issue with root-level `& {}` blocks

## 0.5.25

_2023-03-29_

- fix: Fix typing issues in `color` helper and `ColorValue` type

## 0.5.24

_2023-03-15_

- fix: All `VariableOptions` properties should be optional

## 0.5.23

_2023-01-17_

- fix(ts): Export `StringCompilerOptions`
- fix: Compile using autoprefixer

## 0.5.21 – 0.5.22

_2023-01-04_

- feat: Flag the package as side-effect free via `pkg.sideEffects`
- fix: Compiler removes stray ";" characters after curly-brace blocks

## 0.5.20

_2022-11-14_

- feat(ts): Export unit group aliases `LengthValue`, `LayoutRelativeValue`,
  `FontRelativeValue`

## 0.5.19

_2022-11-03_

- feat(ts): Mark key props of `UnitValue` and `VariablePrinter` readonly
- docs: Improve README by adding VSCode snippets, explaining `unitVal` better

## 0.5.17 – 0.5.18

_2022-10-21_

- feat: Add `unitVal` helper that emits a `UnitNumber` type
- feat(ts): Export `PlainNumber` type
- feat(ts): Add better generics to `unitOf()`
- feat: Silently strip invalid characters from custom variable `namespace`s

## 0.5.16

_2022-10-18_

- feat: Add prop `namespace` to `VariableOptions`

## 0.5.14 – 0.5.15

_2022-10-11_

- feat: Add `nested` option to compiler to disable/configure `postcss-nested`
- feat: Add ` cssVal`` ` templater alias
- feat: Mark the `media` helper as deprecated
- docs: Improve docs and add JSDoc comments to most methods and properties

## 0.5.13

_2022-10-10_

- fix: Make ` css`` ` prefer `toString()` over `valueOf()`

## 0.5.12

_2022-10-06_

- fix: Update `postcss-nesting` plugin to gain essential bugfixes

## 0.5.10 – 0.5.11

_2022-10-05_

- feat: Add `str` quoted string printer
- feat: `VariableValues.override()` now drops properties with `false` values

## 0.5.8 – 0.5.9

_2022-10-04_

- fix: Cleanup temporary files when compiler hits aborting code errors
- fix: Add back `bin/cjs/cli.js` binary, which went AWOL

## 0.5.7

_2022-09-14_

- chore: Add reference paths for easier Intellisense auto-imports of all
  sub-modules

## 0.5.6

_2022-09-12_

- feat: Add lower-level compiler function `compileCSSString`
- docs: Fix issues in README

## 0.5.5

_2022-06-15_

- fix: Change build target to ES2015

## 0.5.4

_2022-06-07_

- chore: Reorganize the contents of the published package

## 0.5.0 — 0.5.3

_2022-06-01_

- **BREAKING** feat: Bump minimum node version to 16
- **BREAKING** feat: Change `VariablePrinter` to a simple object — with
  toString and an `.or()` method for fallbak/default values
- feat(ts): Alias `toString` as `getName` on all basic value printers — to
  hack a nicer DX when using es-in-css values with styled-components
- fix: Check for existstence of global.require before clearing cache
- chore: Add `pkg.exports` description

## 0.4.0

_2022-05-11_

- **BREAKING** feat: Make `makeVariables` accept array of variable names
  - Remove prop `declarations` from `VariableStyles`
  - Add method `.declare()` to `VariableStyles`
  - Remove props `resolveType`, `isColor` from `VariableOptions`
- **BREAKING** feat: Remove introspection prop `type` from `VariablePrinter`

## 0.3.5

_2022-05-10_

- feat(ts): Export type `VariablePrinter`

## 0.3.4

_2022-05-09_

- feat: Add `media` helper
- feat(ts): Export branded types `RawCssValue` and `RawMediaQuery`

## 0.3.3

_2022-05-09_

- feat: Add `unitOf()` helper

## 0.3.2

_2022-05-08_

- feat: Make ` css`` ` convert `null`, `undefined` and `false` to empty string

## 0.3.1

_2022-05-02_

- feat: Add prop `cssName` to `VariablePrinter`s

## 0.3.0

_2022-04-19_

- **BREAKING** feat: Rename `makeVariables` helper (remove `variables`)
- feat: Add `makeVariables.isVar()`
- feat(ts): Export branded types `RawCssString` and `RawCssVarString`
- feat(ts): ` css`` ` and `VariableValues.override()` return `RawCssString`

## 0.2.10

_2022-04-13_

- feat: Add options `banner` and `footer` to `CompilerOptions`
- fix: Bust node's module cache when dynamically importing the same source
- fix: Await JS file-writes in `compileCSSFromJS`

## 0.2.6 — 0.2.9

_2022-04-12_

- feat: Add option `redirect` to `CompilerOptions`
- fix: Compiling input files with absolute paths failed

## 0.2.4 — 0.2.5

_2022-04-11_

- feat: Add `compiler` module, exporting `compileCSS` and `compileCSSFromJS`

## 0.2.3

_2022-04-07_

- feat: Add composition helper `variables.join(...varStyles)`
- feat: Make `VariableValues.declarations` mutable (for inlining overrides)
- feat: Expand `VariableValue` to allow `VariablePrinter` (forwarding `type`)
- feat: Add `--ext` option to the CLI compiler
- fix: `VariableStyles.override()`'s input should accept any `VariableValues`

## 0.2.0 – 0.2.2

_2022-03-17_

- feat: Add simple CLI compiler
- fix: [Patch](https://github.com/maranomynet/es-in-css/commit/56b9dd0a)
  `color` library's lossy `.hex()` method

## 0.1.1 — 0.1.3

_2022-02-20_

- feat: Add `color` helpers
- feat: Add angle unit function `deg()` — and converters from `turn`, `rad`
  and `grad`
- feat: Add new `VariableOptions` methods: `resolveType`, `isColor`
- feat: Add `VariablePrinter.type`
- feat: Log warnings on wonky `scoped()` prefixes (in dev mode)
- docs: Fix error in code example

## 0.1.0

_2022-02-17_

- feat: Initial release with basic feature set — but no compiler yet
