import color_ from 'color';
import * as colorNames from 'color-name';

import Color, { ColorValue } from './color.types.js';

/**
 * CSS color names as defined by the W3C
 *
 * @see https://github.com/maranomynet/es-in-css/tree/v0.7#color-helper
 */
export type ColorName = keyof typeof colorNames;

/**
 * An object that represetns a CSS color value. Can be used in CSS, but also
 * omes with useful manipulation mhethods.
 *
 * @see https://github.com/maranomynet/es-in-css/tree/v0.7#color-helper
 */
export type { ColorValue } from './color.types.js';

// ---------------------------------------------------------------------------

/**
 * Creates `ColorValue` instances that can be used in CSS, but also come with
 * useful manipulation mhethods.
 *
 * @see https://github.com/maranomynet/es-in-css/tree/v0.7#color-helper
 */
/*#__NO_SIDE_EFFECTS__*/
export const color = color_ as typeof Color & {
  fromName(colorName: ColorName): ColorValue;
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
color.prototype.getName = color.prototype.toString;

// Patch color's lossy hex method.
// See: https://github.com/Qix-/color/issues/243
const oldHex = (color.prototype as ColorValue).hex;
(color.prototype as ColorValue).hex = function (value) {
  if (arguments.length > 0) {
    return new color(value);
  }
  // @ts-expect-error  (@types/color don't fully match color's actual implementation)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return this.valpha === 1 ? oldHex.call(this) : this.hexa();
} as ColorValue['hex'];

// ---------------------------------------------------------------------------

/**
 * Create a `ColorValue` instance from a numeric RGB/RGBA color-channel values.
 *
 * @see https://github.com/maranomynet/es-in-css/tree/v0.7#color-helper
 */
/*#__NO_SIDE_EFFECTS__*/
export const rgb = color.rgb;
/**
 * Create a `ColorValue` instance from a numeric HSL/HSLA color-channel values.
 *
 * @see https://github.com/maranomynet/es-in-css/tree/v0.7#color-helper
 */
/*#__NO_SIDE_EFFECTS__*/
export const hsl = color.hsl;

/**
 * Type-safe name to color mapper. Alias for `color(colorName)`
 *
 * @see https://github.com/maranomynet/es-in-css/tree/v0.7#color-helper
 */
/*#__NO_SIDE_EFFECTS__*/
color.fromName = (colorName: ColorName) => color(colorName);
