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

/**
 * Type-safe name to color mapper. Alias for `color(colorName)`
 *
 * 100% typing sugar, no substance.
 */
color.fromName = (colorName: ColorName) => color(colorName);
