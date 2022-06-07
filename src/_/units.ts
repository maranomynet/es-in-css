export class UnitValue<U extends string | never = string> {
  constructor(unit: U, value: plainNumber | UnitValue<U>) {
    this.value = typeof value === 'number' ? value : value.value;
    this.unit = unit;
  }

  value: number;
  unit: U;

  toString() {
    return this.value + this.unit;
  }
  valueOf() {
    return this.value;
  }
  /** @deprecated Typing hack to allow direct printing into styled-components CSS templates. This method is an alias of `.toString()` */
  getName() {
    return this.toString();
  }
}
// eslint-disable-next-line deprecation/deprecation
UnitValue.prototype.getName = UnitValue.prototype.toString;

// ---------------------------------------------------------------------------

export const unitOf = (item: number | UnitValue): undefined | string =>
  item instanceof UnitValue ? item.unit : undefined;

// ---------------------------------------------------------------------------

type plainNumber = number & { unit?: never };

export type PxValue = number & UnitValue<'px'>;
export const px = (n: plainNumber | PxValue) => new UnitValue('px', n) as PxValue;

export type RemValue = number & UnitValue<'rem'>;
export const rem = (n: plainNumber | RemValue) => new UnitValue('rem', n) as RemValue;

export type EmValue = number & UnitValue<'em'>;
export const em = (n: plainNumber | EmValue) => new UnitValue('em', n) as EmValue;

export type ChValue = number & UnitValue<'ch'>;
export const ch = (n: plainNumber | ChValue) => new UnitValue('ch', n) as ChValue;

export type ExValue = number & UnitValue<'ex'>;
export const ex = (n: plainNumber | ExValue) => new UnitValue('ex', n) as ExValue;

export type PctValue = number & UnitValue<'%'>;
export const pct = (n: plainNumber | PctValue) => new UnitValue('%', n) as PctValue;
/** Multiplies the input by 100 before returning a `%` value */
export const pct_f = (n: plainNumber) => pct(n * 100);

export type VwValue = number & UnitValue<'vw'>;
export const vw = (n: plainNumber | VwValue) => new UnitValue('vw', n) as VwValue;
/** Multiplies the input by 100 before returning a `vw` value */
export const vw_f = (n: plainNumber) => vw(n * 100);

export type VhValue = number & UnitValue<'vh'>;
export const vh = (n: plainNumber | VhValue) => new UnitValue('vh', n) as VhValue;
/** Multiplies the input by 100 before returning a `vh` value */
export const vh_f = (n: plainNumber) => vh(n * 100);

export type VminValue = number & UnitValue<'vmin'>;
export const vmin = (n: plainNumber | VminValue) => new UnitValue('vmin', n) as VminValue;
/** Multiplies the input by 100 before returning a `vmin` value */
export const vmin_f = (n: plainNumber) => vmin(n * 100);

export type VmaxValue = number & UnitValue<'vmax'>;
export const vmax = (n: plainNumber | VmaxValue) => new UnitValue('vmax', n) as VmaxValue;
/** Multiplies the input by 100 before returning a `vmax` value */
export const vmax_f = (n: plainNumber) => vmax(n * 100);

export type MsValue = number & UnitValue<'ms'>;
export const ms = (n: plainNumber | MsValue) => new UnitValue('ms', n) as MsValue;
/** Multiplies the input by 1000 before returning a `ms` value */
export const ms_sec = (n: plainNumber) => ms(n * 1000);

export type CmValue = number & UnitValue<'cm'>;
export const cm = (n: plainNumber | CmValue) => new UnitValue('cm', n) as CmValue;
/** Multiplies the input by 2.54 before returning a `cm` value */
export const cm_in = (n: plainNumber) => cm(n * 2.54);
/** Multiplies the input by .1 before returning a `cm` value */
export const cm_mm = (n: plainNumber) => cm(n * 0.1);
/** Multiplies the input by 0.0352777778 before returning a `cm` value */
export const cm_pt = (n: plainNumber) => cm(n * 0.0352777778);
/** Multiplies the input by .42333333333 before returning a `cm` value */
export const cm_pc = (n: plainNumber) => cm(n * 0.42333333333);

export type DegValue = number & UnitValue<'deg'>;
export const deg = (n: plainNumber | DegValue) => new UnitValue('deg', n) as DegValue;
/** Multiplies the input by 360 before returning a `deg` value */
export const deg_turn = (n: plainNumber) => deg(n * 360);
const GRAD_TO_DEG = 360 / 400;
/** Multiplies the input by 0.9 before returning a `deg` value */
export const deg_grad = (n: plainNumber) => deg(n * GRAD_TO_DEG);
const RAD_TO_DEG = 360 / (2 * Math.PI);
/** Multiplies the input by 0.9 before returning a `deg` value */
export const deg_rad = (n: plainNumber) => deg(n * RAD_TO_DEG);
