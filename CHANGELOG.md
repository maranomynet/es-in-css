# Change Log for `es-in-css`

## Upcoming...

- ... <!-- Add new lines here. -->

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
  hack a nicer DX when using es-in-css values with styled-components.
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
