import color_ from 'color';
import * as colorNames from 'color-name';

import Color, { ColorValue } from './color.types.js';

export type { ColorValue } from './color.types.js';

export type ColorName = keyof typeof colorNames;

type ColorPlus = typeof Color & {
  fromName(colorName: ColorName): ColorValue;
};

export const color = color_ as ColorPlus;

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
color.prototype.getName = color.prototype.toString;

export const rgb = color.rgb;
export const hsl = color.hsl;

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

/**
 * Type-safe name to color mapper. Alias for `color(colorName)`
 *
 * 100% typing sugar, no substance.
 */
color.fromName = (colorName: ColorName) => color(colorName);
