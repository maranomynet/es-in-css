import o from 'ospec';

import { compareKeys } from './compiler/_csstest/test-utils';
import * as libTokens from './index';

const tokens: Record<keyof typeof libTokens, true> = {
  // css.ts
  css: true,
  media: true,

  // scoped.ts
  scoped: true,

  // makeVariables.ts
  makeVariables: true,

  // colors.ts
  color: true,
  rgb: true,
  hsl: true,

  // units.ts
  UnitValue: true,
  unitOf: true,

  ch: true,
  cm: true,
  cm_in: true,
  cm_mm: true,
  cm_pc: true,
  cm_pt: true,
  deg: true,
  deg_grad: true,
  deg_rad: true,
  deg_turn: true,
  em: true,
  ex: true,
  ms: true,
  ms_sec: true,
  pct: true,
  pct_f: true,
  px: true,
  rem: true,
  vh: true,
  vh_f: true,
  vmax: true,
  vmax_f: true,
  vmin: true,
  vmin_f: true,
  vw: true,
  vw_f: true,
};

o.spec('es-in-css entry point', () => {
  o('exports all the expected things', () => {
    compareKeys(libTokens, tokens);
  });
});

/* eslint-disable @typescript-eslint/no-unused-vars, unused-imports/no-unused-imports-ts, import/first, simple-import-sort/imports */
import type {
  // css.ts
  RawCssString,
  RawCssValue,
  RawCssVarString,
  RawMediaQuery,

  // scoped.ts

  // variables.ts
  VariableValue,
  VariableStyles,
  VariableOptions,

  // colors.ts
  ColorValue,
  ColorName,

  // units.ts
  PxValue,
  RemValue,
  EmValue,
  ChValue,
  ExValue,
  PctValue,
  VwValue,
  VhValue,
  VminValue,
  VmaxValue,
  MsValue,
  CmValue,
  DegValue,
} from './index';
/* eslint-enisable @typescript-eslint/no-unused-vars, unused-imports/no-unused-imports-ts, simple-import-sort/imports */
