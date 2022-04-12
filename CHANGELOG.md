# Change Log for `es-in-css`

## Upcoming...

- ... <!-- Add new lines here. -->

## 0.2.6

_2022-04-12_

- feat: Add option `redirect` to `CompilerOptions`

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
