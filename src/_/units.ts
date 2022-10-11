/**
 * Abstract class that holds a value and its unit.
 * Provides a `toString` and `valueOf` methods, and nothing else.
 */
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

  /** @deprecated   DO NOT USE.
   * — This is a typing hack to allow direct printing into
   * CSS templates with the popular "styled-components" library.
   * This method is an alias of `.toString()` */
  getName() {
    return this.toString();
  }
}
// eslint-disable-next-line deprecation/deprecation
UnitValue.prototype.getName = UnitValue.prototype.toString;

// ===========================================================================

/**
 * Checks if its given argument is a `UnitValue` instance and returns its unit
 * string. Otherwise returns `undefined`.
 *
 * @see https://github.com/maranomynet/es-in-css#unitof-helper
 */
export const unitOf = (item: number | UnitValue): undefined | string =>
  item instanceof UnitValue ? item.unit : undefined;

// ===========================================================================

type plainNumber = number & { unit?: never };

// NOTE: The below `*Value` types are declared as the intersection of number and UnitValue.
// This is done to tell TypeScript that these values are safe to use in calculations.
// (They are because they have a number-returning `valueOf` method.)

export type PxValue = number & UnitValue<'px'>;
/** Returns a `px` `UnitValue`
 *
 * @see https://github.com/maranomynet/es-in-css#unit-value-helpers
 */
export const px = (n: plainNumber | PxValue) => new UnitValue('px', n) as PxValue;

export type RemValue = number & UnitValue<'rem'>;
/** Returns a `rem` `UnitValue`
 *
 * @see https://github.com/maranomynet/es-in-css#unit-value-helpers
 */
export const rem = (n: plainNumber | RemValue) => new UnitValue('rem', n) as RemValue;

export type EmValue = number & UnitValue<'em'>;
/** Returns a `em` `UnitValue`
 *
 * @see https://github.com/maranomynet/es-in-css#unit-value-helpers
 */
export const em = (n: plainNumber | EmValue) => new UnitValue('em', n) as EmValue;

export type ChValue = number & UnitValue<'ch'>;
/** Returns a `ch` `UnitValue`
 *
 * @see https://github.com/maranomynet/es-in-css#unit-value-helpers
 */
export const ch = (n: plainNumber | ChValue) => new UnitValue('ch', n) as ChValue;

export type ExValue = number & UnitValue<'ex'>;
/** Returns a `ex` `UnitValue`
 *
 * @see https://github.com/maranomynet/es-in-css#unit-value-helpers
 */
export const ex = (n: plainNumber | ExValue) => new UnitValue('ex', n) as ExValue;

export type PctValue = number & UnitValue<'%'>;
/** Returns a `pct` `UnitValue`
 *
 * @see https://github.com/maranomynet/es-in-css#unit-value-helpers
 */
export const pct = (n: plainNumber | PctValue) => new UnitValue('%', n) as PctValue;
/**
 * Convert fraction/proprtion to `%`.
 *
 * Multiplies the input by 100 before returning a `%` value (`PctValue`)
 *
 * @see https://github.com/maranomynet/es-in-css#unit-converters
 */
export const pct_f = (n: plainNumber) => pct(n * 100);

export type VwValue = number & UnitValue<'vw'>;
/** Returns a `vw` `UnitValue`
 *
 * @see https://github.com/maranomynet/es-in-css#unit-value-helpers
 */
export const vw = (n: plainNumber | VwValue) => new UnitValue('vw', n) as VwValue;
/**
 * Convert fraction/proprtion to `vw` per-centage.
 *
 * Multiplies the input by 100 before returning a `vw` value (`VwValue`)
 *
 * @see https://github.com/maranomynet/es-in-css#unit-converters
 */
export const vw_f = (n: plainNumber) => vw(n * 100);

export type VhValue = number & UnitValue<'vh'>;
/** Returns a `vh` `UnitValue`
 *
 * @see https://github.com/maranomynet/es-in-css#unit-value-helpers
 */
export const vh = (n: plainNumber | VhValue) => new UnitValue('vh', n) as VhValue;
/**
 * Convert fraction/proprtion to `vh` per-centage.
 *
 * Multiplies the input by 100 before returning a `vh` value (`VhValue`)
 *
 * @see https://github.com/maranomynet/es-in-css#unit-converters
 */
export const vh_f = (n: plainNumber) => vh(n * 100);

export type VminValue = number & UnitValue<'vmin'>;
/** Returns a `vmin` `UnitValue`
 *
 * @see https://github.com/maranomynet/es-in-css#unit-value-helpers
 */
export const vmin = (n: plainNumber | VminValue) => new UnitValue('vmin', n) as VminValue;
/**
 * Convert fraction/proprtion to `vmin` per-centage.
 *
 * Multiplies the input by 100 before returning a `vmin` value (`VminValue`)
 *
 * @see https://github.com/maranomynet/es-in-css#unit-converters
 */
export const vmin_f = (n: plainNumber) => vmin(n * 100);

export type VmaxValue = number & UnitValue<'vmax'>;
/** Returns a `vmax` `UnitValue`
 *
 * @see https://github.com/maranomynet/es-in-css#unit-value-helpers
 */
export const vmax = (n: plainNumber | VmaxValue) => new UnitValue('vmax', n) as VmaxValue;
/**
 * Convert fraction/proprtion to `vmax` per-centage.
 *
 * Multiplies the input by 100 before returning a `vmax` value (`VmaxValue`)
 *
 * @see https://github.com/maranomynet/es-in-css#unit-converters
 */
export const vmax_f = (n: plainNumber) => vmax(n * 100);

// ===========================================================================

export type MsValue = number & UnitValue<'ms'>;
/** Returns a `ms` `UnitValue`
 *
 * @see https://github.com/maranomynet/es-in-css#unit-value-helpers
 */
export const ms = (n: plainNumber | MsValue) => new UnitValue('ms', n) as MsValue;
/**
 * Convert seconds (`s`) to `ms`.
 *
 * Multiplies the input by 1000 before returning a `ms` value (`MsValue`)
 *
 * @see https://github.com/maranomynet/es-in-css#unit-converters
 */
export const ms_sec = (n: plainNumber) => ms(n * 1000);

// ===========================================================================

export type CmValue = number & UnitValue<'cm'>;
/** Returns a `cm` `UnitValue`
 *
 * @see https://github.com/maranomynet/es-in-css#unit-value-helpers
 */
export const cm = (n: plainNumber | CmValue) => new UnitValue('cm', n) as CmValue;
/**
 * Convert inches (`in`) to `cm`.
 *
 * Multiplies the input by 2.54 before returning a `cm` value (`CmValue`)
 *
 * @see https://github.com/maranomynet/es-in-css#unit-converters
 */
export const cm_in = (n: plainNumber) => cm(n * 2.54);
/**
 * Convert millimeters (`mm`) to `cm`.
 *
 * Multiplies the input by .1 before returning a `cm` value (`CmValue`)
 *
 * @see https://github.com/maranomynet/es-in-css#unit-converters
 */
export const cm_mm = (n: plainNumber) => cm(n * 0.1);
/**
 * Convert points (`pt`) to `cm`.
 *
 * Multiplies the input by 0.0352777778 before returning a `cm` value (`CmValue`)
 *
 * @see https://github.com/maranomynet/es-in-css#unit-converters
 */
export const cm_pt = (n: plainNumber) => cm(n * 0.0352777778);
/**
 * Convert picas (`pc`) to `cm`.
 *
 * Multiplies the input by .42333333333 before returning a `cm` value (`CmValue`)
 *
 * @see https://github.com/maranomynet/es-in-css#unit-converters
 */
export const cm_pc = (n: plainNumber) => cm(n * 0.42333333333);

// ===========================================================================

export type DegValue = number & UnitValue<'deg'>;
/** Returns a `deg` `UnitValue`
 *
 * @see https://github.com/maranomynet/es-in-css#unit-value-helpers
 */
export const deg = (n: plainNumber | DegValue) => new UnitValue('deg', n) as DegValue;
/**
 * Convert turns (`turn`) to `deg`.
 *
 * Multiplies the input by 360 before returning a `deg` value (`DegValue`)
 *
 * @see https://github.com/maranomynet/es-in-css#unit-converters
 */
export const deg_turn = (n: plainNumber) => deg(n * 360);
const GRAD_TO_DEG = 360 / 400;
/**
 * Convert gradians (`grad`) to `deg`.
 *
 * Multiplies the input by 0.9 before returning a `deg` value (`DegValue`)
 *
 * @see https://github.com/maranomynet/es-in-css#unit-converters
 */
export const deg_grad = (n: plainNumber) => deg(n * GRAD_TO_DEG);
const RAD_TO_DEG = 360 / (2 * Math.PI);
/**
 * Convert radians (`rad`) to `deg`.
 *
 * Multiplies the input by 0.9 before returning a `deg` value (`DegValue`)
 *
 * @see https://github.com/maranomynet/es-in-css#unit-converters
 */
export const deg_rad = (n: plainNumber) => deg(n * RAD_TO_DEG);
