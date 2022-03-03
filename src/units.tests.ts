import o from 'ospec';

import {
  cm,
  cm_in,
  cm_mm,
  cm_pc,
  cm_pt,
  deg_grad,
  deg_rad,
  deg_turn,
  ms_sec,
  pct_f,
  px,
  UnitValue,
  vh_f,
  vmax_f,
  vmin_f,
  vw_f,
} from './units';

o.spec('Abstract UnitValue class', () => {
  o('generates object with value and unit', () => {
    const u = new UnitValue('furlong', 123.456);

    o(u.unit).equals('furlong');
    o(u.value).equals(123.456);
    o(u.toString()).equals('123.456furlong');
    o(u.valueOf()).equals(123.456);
  });
});

o.spec('px helper', () => {
  const p = px(123);

  o('returns a PxValue instance', () => {
    // @ts-expect-error  (the hacky  returntype number & UnitValue<'px'> throws off instanceof)
    o(p instanceof UnitValue).equals(true);
  });

  o('plays nicely with the + and math operators', () => {
    o(p + p).equals(123 + 123);
    o('// ' + p).equals('// 123');
    o(`width: ${p}`).equals('width: 123px');
    o(3 * p).equals(3 * 123);
  });

  o('accepts PxValue as input and returns a new PxValue', () => {
    const p2 = px(p);
    o(p2.value).equals(p.value);
    o(p2.unit).equals(p.unit);
    o(p2).notEquals(p);
  });

  o('converts any other UnitValues in to PxValue fo the same value', () => {
    const centi = cm(3.3);
    // @ts-expect-error  (Doesn't like non-PxValue inputs)
    const p2 = px(centi);
    o(p2.toString()).equals('3.3px');
  });
});

o.spec('converters functions', () => {
  o('convert correctly', () => {
    o(pct_f(0.5).toString()).equals('50%')('pct_f');
    o(vw_f(0.5).toString()).equals('50vw')('vw_f');
    o(vh_f(0.5).toString()).equals('50vh')('vh_f');
    o(vmin_f(0.5).toString()).equals('50vmin')('vmin_f');
    o(vmax_f(0.5).toString()).equals('50vmax')('vmax_f');
    o(ms_sec(0.5).toString()).equals('500ms')('ms_sec');
    o(cm_in(0.5).toString()).equals('1.27cm')('cm_in');
    o(cm_mm(0.5).toString()).equals('0.05cm')('cm_mm');
    o(cm_pc(0.5).toString()).equals('0.211666666665cm')('cm_pc');
    o(cm_pt(0.5).toString()).equals('0.0176388889cm')('cm_pt');
    o(deg_turn(-0.5).toString()).equals('-180deg')('deg_turn');
    o(deg_grad(-100).toString()).equals('-90deg')('deg_grad');
    o(deg_rad(Math.PI).toString()).equals('180deg')('deg_rad');
  });
});
