import o from 'ospec';

import { color, ColorName, ColorValue, hsl, rgb } from './colors';

o.spec('color helper', () => {
  o('parses color', () => {
    const col: ColorValue = color('red');
    o(col.hex()).equals('#FF0000');
  });
  o('has vitally important .toString() that emits rgb/rgba', () => {
    o(color('red').toString()).equals('rgb(255, 0, 0)');
    o(color('red').opaquer(-0.5).toString()).equals('rgba(255, 0, 0, 0.5)');
  });

  o('throws on invalid input', () => {
    o(() => color('foo bar')).throws(Error);
    o(() => color('#000 0')).throws(Error);
  });

  o('extends default "color" constructor with `named()` helper', () => {
    const colorName: ColorName = 'black';
    // @ts-expect-error  (Test type safety)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const notColorName: ColorName = 'not a color';

    o(color.fromName(colorName).hex()).equals('#000000');
    o(() => {
      // @ts-expect-error  (Test type safety)
      color.fromName('not a color');
    }).throws(Error);
  });

  o('exports rgb() and hsl() helpers', () => {
    o(rgb).equals(color.rgb);
    o(hsl).equals(color.hsl);
  });
});
