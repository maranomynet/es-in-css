/**
 * Abstract class that holds a value and its unit.
 * Provides a `toString` and `valueOf` methods, and nothing else.
 */
export class UnitValue<U extends string = string> {
  constructor(unit: U, value: PlainNumber | UnitValue<U>) {
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
export function unitOf(item: PlainNumber): undefined;
export function unitOf<U extends string>(item: UnitValue<U>): U;
export function unitOf<U extends string>(item: number | UnitValue<U>): U | undefined {
  return item instanceof UnitValue ? item.unit : undefined;
}

// ===========================================================================

/** A number that is NOT a UnitValue */
export type PlainNumber = number & { unit?: never };

// NOTE: The below `*Value` types are declared as the intersection of number and UnitValue.
// This is done to tell TypeScript that these values are safe to use in calculations.
// (They are because they have a number-returning `valueOf` method.)

export type PxValue = number & UnitValue<'px'>;
/** Returns a `px` `UnitValue`
 *
 * @see https://github.com/maranomynet/es-in-css#unit-value-helpers
 */
export const px = (n: PlainNumber | PxValue) => new UnitValue('px', n) as PxValue;

export type RemValue = number & UnitValue<'rem'>;
/** Returns a `rem` `UnitValue`
 *
 * @see https://github.com/maranomynet/es-in-css#unit-value-helpers
 */
export const rem = (n: PlainNumber | RemValue) => new UnitValue('rem', n) as RemValue;

export type EmValue = number & UnitValue<'em'>;
/** Returns a `em` `UnitValue`
 *
 * @see https://github.com/maranomynet/es-in-css#unit-value-helpers
 */
export const em = (n: PlainNumber | EmValue) => new UnitValue('em', n) as EmValue;

export type ChValue = number & UnitValue<'ch'>;
/** Returns a `ch` `UnitValue`
 *
 * @see https://github.com/maranomynet/es-in-css#unit-value-helpers
 */
export const ch = (n: PlainNumber | ChValue) => new UnitValue('ch', n) as ChValue;

export type ExValue = number & UnitValue<'ex'>;
/** Returns a `ex` `UnitValue`
 *
 * @see https://github.com/maranomynet/es-in-css#unit-value-helpers
 */
export const ex = (n: PlainNumber | ExValue) => new UnitValue('ex', n) as ExValue;

export type PctValue = number & UnitValue<'%'>;
/** Returns a `pct` `UnitValue`
 *
 * @see https://github.com/maranomynet/es-in-css#unit-value-helpers
 */
export const pct = (n: PlainNumber | PctValue) => new UnitValue('%', n) as PctValue;
/**
 * Convert fraction/proprtion to `%`.
 *
 * Multiplies the input by 100 before returning a `%` value (`PctValue`)
 *
 * @see https://github.com/maranomynet/es-in-css#unit-converters
 */
export const pct_f = (n: PlainNumber) => pct(n * 100);

export type VwValue = number & UnitValue<'vw'>;
/** Returns a `vw` `UnitValue`
 *
 * @see https://github.com/maranomynet/es-in-css#unit-value-helpers
 */
export const vw = (n: PlainNumber | VwValue) => new UnitValue('vw', n) as VwValue;
/**
 * Convert fraction/proprtion to `vw` per-centage.
 *
 * Multiplies the input by 100 before returning a `vw` value (`VwValue`)
 *
 * @see https://github.com/maranomynet/es-in-css#unit-converters
 */
export const vw_f = (n: PlainNumber) => vw(n * 100);

export type VhValue = number & UnitValue<'vh'>;
/** Returns a `vh` `UnitValue`
 *
 * @see https://github.com/maranomynet/es-in-css#unit-value-helpers
 */
export const vh = (n: PlainNumber | VhValue) => new UnitValue('vh', n) as VhValue;
/**
 * Convert fraction/proprtion to `vh` per-centage.
 *
 * Multiplies the input by 100 before returning a `vh` value (`VhValue`)
 *
 * @see https://github.com/maranomynet/es-in-css#unit-converters
 */
export const vh_f = (n: PlainNumber) => vh(n * 100);

export type VminValue = number & UnitValue<'vmin'>;
/** Returns a `vmin` `UnitValue`
 *
 * @see https://github.com/maranomynet/es-in-css#unit-value-helpers
 */
export const vmin = (n: PlainNumber | VminValue) => new UnitValue('vmin', n) as VminValue;
/**
 * Convert fraction/proprtion to `vmin` per-centage.
 *
 * Multiplies the input by 100 before returning a `vmin` value (`VminValue`)
 *
 * @see https://github.com/maranomynet/es-in-css#unit-converters
 */
export const vmin_f = (n: PlainNumber) => vmin(n * 100);

export type VmaxValue = number & UnitValue<'vmax'>;
/** Returns a `vmax` `UnitValue`
 *
 * @see https://github.com/maranomynet/es-in-css#unit-value-helpers
 */
export const vmax = (n: PlainNumber | VmaxValue) => new UnitValue('vmax', n) as VmaxValue;
/**
 * Convert fraction/proprtion to `vmax` per-centage.
 *
 * Multiplies the input by 100 before returning a `vmax` value (`VmaxValue`)
 *
 * @see https://github.com/maranomynet/es-in-css#unit-converters
 */
export const vmax_f = (n: PlainNumber) => vmax(n * 100);

// ===========================================================================

export type MsValue = number & UnitValue<'ms'>;
/** Returns a `ms` `UnitValue`
 *
 * @see https://github.com/maranomynet/es-in-css#unit-value-helpers
 */
export const ms = (n: PlainNumber | MsValue) => new UnitValue('ms', n) as MsValue;
/**
 * Convert seconds (`s`) to `ms`.
 *
 * Multiplies the input by 1000 before returning a `ms` value (`MsValue`)
 *
 * @see https://github.com/maranomynet/es-in-css#unit-converters
 */
export const ms_sec = (n: PlainNumber) => ms(n * 1000);

// ===========================================================================

export type CmValue = number & UnitValue<'cm'>;
/** Returns a `cm` `UnitValue`
 *
 * @see https://github.com/maranomynet/es-in-css#unit-value-helpers
 */
export const cm = (n: PlainNumber | CmValue) => new UnitValue('cm', n) as CmValue;
/**
 * Convert inches (`in`) to `cm`.
 *
 * Multiplies the input by 2.54 before returning a `cm` value (`CmValue`)
 *
 * @see https://github.com/maranomynet/es-in-css#unit-converters
 */
export const cm_in = (n: PlainNumber) => cm(n * 2.54);
/**
 * Convert millimeters (`mm`) to `cm`.
 *
 * Multiplies the input by .1 before returning a `cm` value (`CmValue`)
 *
 * @see https://github.com/maranomynet/es-in-css#unit-converters
 */
export const cm_mm = (n: PlainNumber) => cm(n * 0.1);
/**
 * Convert points (`pt`) to `cm`.
 *
 * Multiplies the input by 0.0352777778 before returning a `cm` value (`CmValue`)
 *
 * @see https://github.com/maranomynet/es-in-css#unit-converters
 */
export const cm_pt = (n: PlainNumber) => cm(n * 0.0352777778);
/**
 * Convert picas (`pc`) to `cm`.
 *
 * Multiplies the input by .42333333333 before returning a `cm` value (`CmValue`)
 *
 * @see https://github.com/maranomynet/es-in-css#unit-converters
 */
export const cm_pc = (n: PlainNumber) => cm(n * 0.42333333333);

// ===========================================================================

export type DegValue = number & UnitValue<'deg'>;
/** Returns a `deg` `UnitValue`
 *
 * @see https://github.com/maranomynet/es-in-css#unit-value-helpers
 */
export const deg = (n: PlainNumber | DegValue) => new UnitValue('deg', n) as DegValue;
/**
 * Convert turns (`turn`) to `deg`.
 *
 * Multiplies the input by 360 before returning a `deg` value (`DegValue`)
 *
 * @see https://github.com/maranomynet/es-in-css#unit-converters
 */
export const deg_turn = (n: PlainNumber) => deg(n * 360);
const GRAD_TO_DEG = 360 / 400;
/**
 * Convert gradians (`grad`) to `deg`.
 *
 * Multiplies the input by 0.9 before returning a `deg` value (`DegValue`)
 *
 * @see https://github.com/maranomynet/es-in-css#unit-converters
 */
export const deg_grad = (n: PlainNumber) => deg(n * GRAD_TO_DEG);
const RAD_TO_DEG = 360 / (2 * Math.PI);
/**
 * Convert radians (`rad`) to `deg`.
 *
 * Multiplies the input by 0.9 before returning a `deg` value (`DegValue`)
 *
 * @see https://github.com/maranomynet/es-in-css#unit-converters
 */
export const deg_rad = (n: PlainNumber) => deg(n * RAD_TO_DEG);
