/* eslint-disable simple-import-sort/imports */
import o from 'ospec';

const tokens = [
  // css.ts
  'css',

  // scoped.ts
  'scoped',

  // makeVariables.ts
  'makeVariables',

  // colors.ts
  'color',
  'rgb',
  'hsl',

  // units.ts
  'UnitValue',
  'ch',
  'cm',
  'cm_in',
  'cm_mm',
  'cm_pc',
  'cm_pt',
  'deg',
  'deg_grad',
  'deg_rad',
  'deg_turn',
  'em',
  'ex',
  'ms',
  'ms_sec',
  'pct',
  'pct_f',
  'px',
  'rem',
  'vh',
  'vh_f',
  'vmax',
  'vmax_f',
  'vmin',
  'vmin_f',
  'vw',
  'vw_f',
];

o.spec('es-in-css entry point', () => {
  o('exports all the things', (done) => {
    import('./index').then((exports) => {
      tokens.forEach((token) => {
        o(token in exports).equals(true)(`including "${token}"`);
      });

      o(Object.keys(exports).length).equals(tokens.length)('number of tokens is correct');

      done();
    });
  });
});

/* eslint-disable @typescript-eslint/no-unused-vars, unused-imports/no-unused-imports-ts, import/first */
import type {
  // css.ts

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
} from './';
/* eslint-enisable @typescript-eslint/no-unused-vars, unused-imports/no-unused-imports-ts */
