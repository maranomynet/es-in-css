/**
 * Abstract class that holds a value and its unit.
 * Provides a `toString` and `valueOf` methods, and nothing else.
 */
export class UnitValue<U extends string = string> {
  constructor(unit: U, value: PlainNumber | UnitValue<U>) {
    // TODO: Decide if we want to error/warn on empoty `unit` strings
    // TODO: Decide if we want to error/warn on invalid UnitValue types
    this.value = typeof value === 'number' ? value : value.value;
    this.unit = unit;
  }

  readonly value: number;
  readonly unit: U;

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

/** A UnitValue instance that can be casually used in plain calculations. \
 * However, It will fail `typeof x === "number"` checks.
 */
type UnitNumber<U extends string> = number & UnitValue<U>;

/**
 * Creates a custom UnitValue instance that is also typed as a `number` as to
 * tell TypeScript that the value is safe to use in calculations. (They are
 * because they have a number-returning `.valueOf()` method.)
 *
 * **NOTE:** This white "lie" about the `number` type may cause problems at
 * runtime if these `UnitNumbers` end up in situations where
 * `typeof x === "number"` is used to validate a literal number value. \
 * However, the risk vs. benefit trade-off seems reasonable.
 *
 * @see https://github.com/maranomynet/es-in-css#unitval-helper
 */
export const unitVal = <U extends string>(value: PlainNumber | UnitValue<U>, unit: U) =>
  new UnitValue(unit, value) as UnitNumber<U>;

// ===========================================================================

/**
 * Checks if its given argument is a `UnitValue` instance and returns its unit
 * string. Otherwise returns `undefined`.
 *
 * @see https://github.com/maranomynet/es-in-css#unitof-helper
 */
export function unitOf(item: PlainNumber): undefined;
export function unitOf<U extends string>(item: UnitValue<U>): U;
export function unitOf<U extends string>(item: number | UnitValue<U>): U | undefined;

export function unitOf<U extends string>(item: number | UnitValue<U>): U | undefined {
  return item instanceof UnitValue ? item.unit : undefined;
}

// ===========================================================================

/** A number that is NOT a UnitValue */
export type PlainNumber = number & { unit?: never };

// ---------------------------------------------------------------------------

export type PxValue = UnitNumber<'px'>;
/** Returns a `px` `UnitNumber`
 *
 * @see https://github.com/maranomynet/es-in-css#unit-value-helpers
 */
export const px = (n: PlainNumber | PxValue): PxValue => unitVal(n, 'px');

// ---------------------------------------------------------------------------

export type RemValue = UnitNumber<'rem'>;
/** Returns a `rem` `UnitNumber`
 *
 * @see https://github.com/maranomynet/es-in-css#unit-value-helpers
 */
export const rem = (n: PlainNumber | RemValue): RemValue => unitVal(n, 'rem');

// ---------------------------------------------------------------------------

export type EmValue = UnitNumber<'em'>;
/** Returns a `em` `UnitNumber`
 *
 * @see https://github.com/maranomynet/es-in-css#unit-value-helpers
 */
export const em = (n: PlainNumber | EmValue): EmValue => unitVal(n, 'em');

// ---------------------------------------------------------------------------

export type ChValue = UnitNumber<'ch'>;
/** Returns a `ch` `UnitNumber`
 *
 * @see https://github.com/maranomynet/es-in-css#unit-value-helpers
 */
export const ch = (n: PlainNumber | ChValue): ChValue => unitVal(n, 'ch');

// ---------------------------------------------------------------------------

export type ExValue = UnitNumber<'ex'>;
/** Returns a `ex` `UnitNumber`
 *
 * @see https://github.com/maranomynet/es-in-css#unit-value-helpers
 */
export const ex = (n: PlainNumber | ExValue): ExValue => unitVal(n, 'ex');

// ---------------------------------------------------------------------------

export type PctValue = UnitNumber<'%'>;
/** Returns a `pct` `UnitNumber`
 *
 * @see https://github.com/maranomynet/es-in-css#unit-value-helpers
 */
export const pct = (n: PlainNumber | PctValue): PctValue => unitVal(n, '%');

/**
 * Convert fraction/proprtion to `%`.
 *
 * Multiplies the input by 100 before returning a `%` value (`PctValue`)
 *
 * @see https://github.com/maranomynet/es-in-css#unit-converters
 */
export const pct_f = (n: PlainNumber) => pct(n * 100);

// ---------------------------------------------------------------------------

export type VwValue = UnitNumber<'vw'>;
/** Returns a `vw` `UnitNumber`
 *
 * @see https://github.com/maranomynet/es-in-css#unit-value-helpers
 */
export const vw = (n: PlainNumber | VwValue): VwValue => unitVal(n, 'vw');

/**
 * Convert fraction/proprtion to `vw` per-centage.
 *
 * Multiplies the input by 100 before returning a `vw` value (`VwValue`)
 *
 * @see https://github.com/maranomynet/es-in-css#unit-converters
 */
export const vw_f = (n: PlainNumber) => vw(n * 100);

// ---------------------------------------------------------------------------

export type VhValue = UnitNumber<'vh'>;
/** Returns a `vh` `UnitNumber`
 *
 * @see https://github.com/maranomynet/es-in-css#unit-value-helpers
 */
export const vh = (n: PlainNumber | VhValue): VhValue => unitVal(n, 'vh');

/**
 * Convert fraction/proprtion to `vh` per-centage.
 *
 * Multiplies the input by 100 before returning a `vh` value (`VhValue`)
 *
 * @see https://github.com/maranomynet/es-in-css#unit-converters
 */
export const vh_f = (n: PlainNumber) => vh(n * 100);

// ---------------------------------------------------------------------------

export type VminValue = UnitNumber<'vmin'>;
/** Returns a `vmin` `UnitNumber`
 *
 * @see https://github.com/maranomynet/es-in-css#unit-value-helpers
 */
export const vmin = (n: PlainNumber | VminValue): VminValue => unitVal(n, 'vmin');

/**
 * Convert fraction/proprtion to `vmin` per-centage.
 *
 * Multiplies the input by 100 before returning a `vmin` value (`VminValue`)
 *
 * @see https://github.com/maranomynet/es-in-css#unit-converters
 */
export const vmin_f = (n: PlainNumber) => vmin(n * 100);

// ---------------------------------------------------------------------------

export type VmaxValue = UnitNumber<'vmax'>;
/** Returns a `vmax` `UnitNumber`
 *
 * @see https://github.com/maranomynet/es-in-css#unit-value-helpers
 */
export const vmax = (n: PlainNumber | VmaxValue): VmaxValue => unitVal(n, 'vmax');

/**
 * Convert fraction/proprtion to `vmax` per-centage.
 *
 * Multiplies the input by 100 before returning a `vmax` value (`VmaxValue`)
 *
 * @see https://github.com/maranomynet/es-in-css#unit-converters
 */
export const vmax_f = (n: PlainNumber) => vmax(n * 100);

// ---------------------------------------------------------------------------

export type MsValue = UnitNumber<'ms'>;
/** Returns a `ms` `UnitNumber`
 *
 * @see https://github.com/maranomynet/es-in-css#unit-value-helpers
 */
export const ms = (n: PlainNumber | MsValue): MsValue => unitVal(n, 'ms');

/**
 * Convert seconds (`s`) to `ms`.
 *
 * Multiplies the input by 1000 before returning a `ms` value (`MsValue`)
 *
 * @see https://github.com/maranomynet/es-in-css#unit-converters
 */
export const ms_sec = (n: PlainNumber) => ms(n * 1000);

// ---------------------------------------------------------------------------

export type CmValue = UnitNumber<'cm'>;
/** Returns a `cm` `UnitNumber`
 *
 * @see https://github.com/maranomynet/es-in-css#unit-value-helpers
 */
export const cm = (n: PlainNumber | CmValue): CmValue => unitVal(n, 'cm');

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

// ---------------------------------------------------------------------------

export type DegValue = UnitNumber<'deg'>;
/** Returns a `deg` `UnitNumber`
 *
 * @see https://github.com/maranomynet/es-in-css#unit-value-helpers
 */
export const deg = (n: PlainNumber | DegValue): DegValue => unitVal(n, 'deg');

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

// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------

export type LengthValue = PxValue | CmValue | LayoutRelativeValue | FontRelativeValue;
export type LayoutRelativeValue = PctValue | VwValue | VhValue | VminValue | VmaxValue;
export type FontRelativeValue = EmValue | RemValue | ChValue | ExValue;
