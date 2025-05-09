import { describe, expect, test } from 'bun:test';

import { color, ColorName, ColorValue, hsl, rgb } from './colors.js';

// ===========================================================================

describe('color helper', () => {
  test('parses color', () => {
    const col: ColorValue = color('red');
    expect(col.hex()).toBe('#FF0000');
  });
  test('has vitally important .toString() that emits rgb/rgba', () => {
    expect(color('red').toString()).toBe('rgb(255, 0, 0)');
    expect(color('red').opaquer(-0.5).toString()).toBe('rgba(255, 0, 0, 0.5)');
  });

  test('adds a getName method', () => {
    const col = color('red');
    const col2 = col.opaquer(-0.5);
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    expect(col.getName).toBe(col.toString);
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    expect(col2.getName).toBe(col2.toString); // 'inherited down to secondary instances'
  });

  test('throws on invalid input', () => {
    expect(() => color('foo bar')).toThrow(Error);
    expect(() => color('#000 0')).toThrow(Error);
  });

  test('extends default "color" constructor with `named()` helper', () => {
    const colorName: ColorName = 'black';
    // @ts-expect-error  (Test type safety)

    const notColorName: ColorName = 'not a color';

    expect(color.fromName(colorName).hex()).toBe('#000000');
    expect(() => color.fromName(notColorName)).toThrow(Error);
  });

  test('exports rgb() and hsl() helpers', () => {
    expect(rgb).toBe(color.rgb);
    expect(hsl).toBe(color.hsl);
  });
});

// ===========================================================================
