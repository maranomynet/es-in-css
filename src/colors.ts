import Color from 'color';
import * as colorNames from 'color-name';

export type { default as ColorValue } from 'color';

export type ColorName = keyof typeof colorNames;

type ColorPlus = typeof Color & {
  fromName(colorName: ColorName): Color;
};

export const color = Color as ColorPlus;

export const rgb = color.rgb;
export const hsl = color.hsl;

// Patch color's lossy hex method.
// See: https://github.com/Qix-/color/issues/243
const oldHex = (color.prototype as Color).hex;
(color.prototype as Color).hex = function (value) {
  if (arguments.length > 0) {
    return new Color(value);
  }
  // @ts-expect-error  (@types/color don't fully match color's actual implementation)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return this.valpha === 1 ? oldHex.call(this) : this.hexa();
} as Color['hex'];

/**
 * Type-safe name to color mapper. Alias for `color(colorName)`
 *
 * 100% typing sugar, no substance.
 */
color.fromName = (colorName: ColorName) => color(colorName);
