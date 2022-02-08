import {
  ChValue,
  EmValue,
  ExValue,
  MmValue,
  MsValue,
  PctValue,
  PxValue,
  RemValue,
  VhValue,
  VmaxValue,
  VminValue,
  VwValue,
} from './units';

export const px = (n: number | PxValue) => new PxValue(n);
export const rem = (n: number | RemValue) => new RemValue(n);
export const em = (n: number | EmValue) => new EmValue(n);
export const ch = (n: number | ChValue) => new ChValue(n);
export const ex = (n: number | ExValue) => new ExValue(n);

export const pct = (n: number | PctValue) => new PctValue(n);
/** Multiplies the input by 100 before returning a `%` value */
export const pct_f = (n: number) => new PctValue(n * 100);

export const vw = (n: number | VwValue) => new VwValue(n);
/** Multiplies the input by 100 before returning a `vw` value */
export const vw_f = (n: number) => new VwValue(n * 100);

export const vh = (n: number | VhValue) => new VhValue(n);
/** Multiplies the input by 100 before returning a `vh` value */
export const vh_f = (n: number) => new VhValue(n * 100);

export const vmin = (n: number | VminValue) => new VminValue(n);
/** Multiplies the input by 100 before returning a `vmin` value */
export const vmin_f = (n: number) => new VminValue(n * 100);

export const vmax = (n: number | VmaxValue) => new VmaxValue(n);
/** Multiplies the input by 100 before returning a `vmax` value */
export const vmax_f = (n: number) => new VmaxValue(n * 100);

export const ms = (n: number | MsValue) => new MsValue(n);
/** Multiplies the input by 1000 before returning a `ms` value */
export const ms_sec = (n: number) => new MsValue(n * 1000);

export const mm = (n: number | MmValue) => new MmValue(n);
/** Multiplies the input by 25.4 before returning a `mm` value */
export const mm_inch = (n: number) => new MmValue(n * 25.4);
/** Multiplies the input by 10 before returning a `mm` value */
export const mm_cm = (n: number) => new MmValue(n * 10);
/** Multiplies the input by 0.352777778 before returning a `mm` value */
export const mm_pt = (n: number) => new MmValue(n * 0.352777778);
/** Multiplies the input by 4.2333333333 before returning a `mm` value */
export const mm_pc = (n: number) => new MmValue(n * 4.2333333333);
