import type {
  ChValue,
  CmValue,
  ColorName,
  // colors.ts
  ColorValue,
  CssMediaQueryString,
  // css.ts
  CssString,
  CssVarString,
  DegValue,
  EmValue,
  ExValue,
  FontRelativeValue,
  LayoutRelativeValue,
  // Groups:
  LengthValue,
  MsValue,
  PctValue,
  // units.ts
  PlainNumber,
  PxValue,
  RawCssString,
  RawCssVarString,
  RawMediaQuery,
  RemValue,
  // @ts-expect-error  (Should NOT be exported)
  UnitNumber,
  UnitValue,
  VariableOptions,
  VariablePrinter,
  VariableStyles,
  // scoped.ts
  // variables.ts
  VariableValue,
  VhValue,
  VmaxValue,
  VminValue,
  VwValue,
} from './index.js';
import * as moduleExports from './index.js';

// ===========================================================================
// Test Type Signature and Exports

if (false as boolean) {
  /* eslint-disable @typescript-eslint/no-unused-vars */

  // Make sure the module exports are as advertised
  const exports: Record<keyof typeof moduleExports, true> = {
    // css.ts
    css: true,
    cssVal: true,
    media: true,
    str: true,

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
    unitVal: true,

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
    fr: true,
  };

  // css.ts
  type CssString_is_exported = CssString;
  type CssVarString_is_exported = CssVarString;
  type CssMediaQueryString_is_exported = CssMediaQueryString;

  // eslint-disable-next-line @typescript-eslint/no-deprecated
  type RawCssString_is_exported = RawCssString;
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  type RawCssVarString_is_exported = RawCssVarString;
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  type RawMediaQuery_is_exported = RawMediaQuery;

  // scoped.ts

  // variables.ts
  type VariableValue_is_exported = VariableValue;
  type VariableStyles_is_exported<T extends string> = VariableStyles<string>;
  type VariableOptions_is_exported = VariableOptions;
  type VariablePrinter_is_exported = VariablePrinter;

  // colors.ts
  type ColorValue_is_exported = ColorValue;
  type ColorName_is_exported = ColorName;

  // units.ts
  type PlainNumber_is_exported = PlainNumber;
  type UnitValue_is_exported = UnitValue;
  type UnitNumber_is_exported = UnitNumber; //<-- Should NOT be exported!rted
  type PxValue_is_exported = PxValue;
  type RemValue_is_exported = RemValue;
  type EmValue_is_exported = EmValue;
  type ChValue_is_exported = ChValue;
  type ExValue_is_exported = ExValue;
  type PctValue_is_exported = PctValue;
  type VwValue_is_exported = VwValue;
  type VhValue_is_exported = VhValue;
  type VminValue_is_exported = VminValue;
  type VmaxValue_is_exported = VmaxValue;
  type MsValue_is_exported = MsValue;
  type CmValue_is_exported = CmValue;
  type DegValue_is_exported = DegValue;
  // Groups:
  type LengthValue_is_exported = LengthValue;
  type LayoutRelativeValue_is_exported = LayoutRelativeValue;
  type FontRelativeValue_is_exported = FontRelativeValue;

  /* eslint-enable @typescript-eslint/no-unused-vars */
}

// ===========================================================================
// Test Individual Functions

// Set timezone to something ahead of UTC to make sure tests don't depend on local time
process.env.TZ = 'Asia/Yangon';
