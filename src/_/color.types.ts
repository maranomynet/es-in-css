// Copied from https://github.com/DefinitelyTyped/DefinitelyTyped/blob/297f116dcdbe8382a5e2b7b6aa0324f626e6f212/types/color/index.d.ts
// - Removed the unnecessary generics
// - Renamed `Color` to `ColorValue` to avoid name collision with the `Color` class
// - Added custom "HACK Addition" for es-in-css
// ===========================================================================

// Type definitions for color 3.0
// Project: https://github.com/qix-/color#readme
// Definitions by: Junyoung Clare Jang <https://github.com/Airlun>
//                 James W. Lane <https://github.com/jameswlane>
//                 Adam Haglund <https://github.com/BeeeQueue>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 3.7

import convert from 'color-convert';

type ColorParam =
  | ColorValue
  | string
  | ArrayLike<number>
  | number
  | { [key: string]: any };

export type ColorValue = {
  // BEGIN: HACK Addition
  /** @deprecated Typing hack to allow direct printing into styled-components CSS templates. This method is an alias of `.toString()` */
  getName(): string;
  // END: HACK Addition

  toString(): string;
  toJSON(): ColorValue;
  string(places?: number): string;
  percentString(places?: number): string;
  array(): Array<number>;
  object(): { alpha?: number | undefined } & { [key: string]: number };
  unitArray(): Array<number>;
  unitObject(): { r: number; g: number; b: number; alpha?: number | undefined };
  round(places?: number): ColorValue;
  alpha(): number;
  alpha(val: number): ColorValue;
  red(): number;
  red(val: number): ColorValue;
  green(): number;
  green(val: number): ColorValue;
  blue(): number;
  blue(val: number): ColorValue;
  hue(): number;
  hue(val: number): ColorValue;
  saturationl(): number;
  saturationl(val: number): ColorValue;
  lightness(): number;
  lightness(val: number): ColorValue;
  saturationv(): number;
  saturationv(val: number): ColorValue;
  value(): number;
  value(val: number): ColorValue;
  chroma(): number;
  chroma(val: number): ColorValue;
  gray(): number;
  gray(val: number): ColorValue;
  white(): number;
  white(val: number): ColorValue;
  wblack(): number;
  wblack(val: number): ColorValue;
  cyan(): number;
  cyan(val: number): ColorValue;
  magenta(): number;
  magenta(val: number): ColorValue;
  yellow(): number;
  yellow(val: number): ColorValue;
  black(): number;
  black(val: number): ColorValue;
  x(): number;
  x(val: number): ColorValue;
  y(): number;
  y(val: number): ColorValue;
  z(): number;
  z(val: number): ColorValue;
  l(): number;
  l(val: number): ColorValue;
  a(): number;
  a(val: number): ColorValue;
  b(): number;
  b(val: number): ColorValue;
  keyword(): string;
  keyword<V extends string>(val: V): ColorValue;
  hex(): string;
  hex<V extends string>(val: V): ColorValue;
  hexa(): string;
  hexa<V extends string>(val: V): ColorValue;
  rgbNumber(): number;
  luminosity(): number;
  contrast(color2: ColorValue): number;
  level(color2: ColorValue): 'AAA' | 'AA' | '';
  isDark(): boolean;
  isLight(): boolean;
  negate(): ColorValue;
  lighten(ratio: number): ColorValue;
  darken(ratio: number): ColorValue;
  saturate(ratio: number): ColorValue;
  desaturate(ratio: number): ColorValue;
  whiten(ratio: number): ColorValue;
  blacken(ratio: number): ColorValue;
  grayscale(): ColorValue;
  fade(ratio: number): ColorValue;
  opaquer(ratio: number): ColorValue;
  rotate(degrees: number): ColorValue;
  mix(mixinColor: ColorValue, weight?: number): ColorValue;

  rgb(...args: Array<number>): ColorValue;
  hsl(...args: Array<number>): ColorValue;
  hsv(...args: Array<number>): ColorValue;
  hwb(...args: Array<number>): ColorValue;
  cmyk(...args: Array<number>): ColorValue;
  xyz(...args: Array<number>): ColorValue;
  lab(...args: Array<number>): ColorValue;
  lch(...args: Array<number>): ColorValue;
  ansi16(...args: Array<number>): ColorValue;
  ansi256(...args: Array<number>): ColorValue;
  hcg(...args: Array<number>): ColorValue;
  apple(...args: Array<number>): ColorValue;
};

type ColorConstructor = {
  (obj?: ColorParam, model?: keyof typeof convert): ColorValue;
  new (obj?: ColorParam, model?: keyof typeof convert): ColorValue;
  rgb(...val: Array<number>): ColorValue;
  rgb(color: ColorParam): ColorValue;
  hsl(...val: Array<number>): ColorValue;
  hsl(color: ColorParam): ColorValue;
  hsv(...val: Array<number>): ColorValue;
  hsv(color: ColorParam): ColorValue;
  hwb(...val: Array<number>): ColorValue;
  hwb(color: ColorParam): ColorValue;
  cmyk(...val: Array<number>): ColorValue;
  cmyk(color: ColorParam): ColorValue;
  xyz(...val: Array<number>): ColorValue;
  xyz(color: ColorParam): ColorValue;
  lab(...val: Array<number>): ColorValue;
  lab(color: ColorParam): ColorValue;
  lch(...val: Array<number>): ColorValue;
  lch(color: ColorParam): ColorValue;
  ansi16(...val: Array<number>): ColorValue;
  ansi16(color: ColorParam): ColorValue;
  ansi256(...val: Array<number>): ColorValue;
  ansi256(color: ColorParam): ColorValue;
  hcg(...val: Array<number>): ColorValue;
  hcg(color: ColorParam): ColorValue;
  apple(...val: Array<number>): ColorValue;
  apple(color: ColorParam): ColorValue;
};

declare const Color: ColorConstructor;

export default Color;
