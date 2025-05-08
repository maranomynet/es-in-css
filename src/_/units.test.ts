import { describe, expect, test } from 'bun:test';

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
  pct,
  pct_f,
  PlainNumber,
  px,
  PxValue,
  rem,
  unitOf,
  unitVal,
  UnitValue,
  vh_f,
  vmax_f,
  vmin_f,
  vw_f,
} from './units.js';

// ===========================================================================
// Test Type Signature and Exports

if (false as boolean) {
  // Assert that UnitValues masquerade as numbers in TypeScript
  // Assert that PlainNumber type guards against unwanted random Unitvalues
  const foo = (v: PlainNumber | PxValue) => px(v);
  foo(44);
  foo(px(44));
  const remVal = rem(44);
  // @ts-expect-error  (testing bad input)
  foo(remVal);
  const customVal = new UnitValue('custom', 99);
  // @ts-expect-error  (testing bad input)
  foo(customVal);
}

// ===========================================================================
// Test Individual Functions

// Set timezone to something ahead of UTC to make sure tests don't depend on local time
process.env.TZ = 'Asia/Yangon';

describe('Abstract UnitValue class', () => {
  test('generates object with value and unit', () => {
    const u = new UnitValue('furlong', 123.456);

    expect(u.unit).toBe('furlong');
    expect(u.value).toBe(123.456);
    expect(u.toString()).toBe('123.456furlong');
    expect(u.valueOf()).toBe(123.456);
    expect(u.getName()).toBe(u.toString()); // getName behaves like toString
  });
});

// ===========================================================================

describe('px helper', () => {
  const p = px(123);

  test('returns a PxValue instance', () => {
    // @ts-expect-error  (the hacky  returntype number & UnitValue<'px'> throws off instanceof)
    expect(p instanceof UnitValue).toBe(true);
  });

  test('plays nicely with the + and math operators', () => {
    expect(p + p).toBe(123 + 123);
    // Testing old-style "+" concatenation, which uses `.valueOf()` instead of `.toString()`
    expect('// ' + p).toBe('// 123'); // eslint-disable-line prefer-template
    expect(`width: ${p}`).toBe('width: 123px');
    expect(3 * p).toBe(3 * 123);
  });

  test('accepts PxValue as input and returns a new PxValue', () => {
    const p2 = px(p);
    expect(p2.value).toBe(p.value);
    expect(p2.unit).toBe(p.unit);
    expect(p2).not.toBe(p);
  });

  test('converts any other UnitValues in to PxValue fo the same value', () => {
    const centi = cm(3.3);
    // @ts-expect-error  (Doesn't like non-PxValue inputs)
    const p2 = px(centi);
    expect(p2.toString()).toBe('3.3px');
  });
});

// ===========================================================================

describe('converters functions', () => {
  test('convert correctly', () => {
    expect(pct_f(0.5).toString()).toBe('50%'); // pct_f
    expect(vw_f(0.5).toString()).toBe('50vw'); // vw_f
    expect(vh_f(0.5).toString()).toBe('50vh'); // vh_f
    expect(vmin_f(0.5).toString()).toBe('50vmin'); // vmin_f
    expect(vmax_f(0.5).toString()).toBe('50vmax'); // vmax_f
    expect(ms_sec(0.5).toString()).toBe('500ms'); // ms_sec
    expect(cm_in(0.5).toString()).toBe('1.27cm'); // cm_in
    expect(cm_mm(0.5).toString()).toBe('0.05cm'); // cm_mm
    expect(cm_pc(0.5).toString()).toBe('0.211666666665cm'); // cm_pc
    expect(cm_pt(0.5).toString()).toBe('0.0176388889cm'); // cm_pt
    expect(deg_turn(-0.5).toString()).toBe('-180deg'); // deg_turn
    expect(deg_grad(-100).toString()).toBe('-90deg'); // deg_grad
    expect(deg_rad(Math.PI).toString()).toBe('180deg'); // deg_rad
  });
});

// ===========================================================================

describe('unitOf helper', () => {
  test('detects UnitValue units', () => {
    expect(unitOf(px(100))).toBe('px');
    expect(unitOf(pct(10))).toBe('%');
    expect(unitOf(ms_sec(1))).toBe('ms');
    expect(unitOf(new UnitValue('Quonks', 1.5))).toBe('Quonks');
  });
  test('returns undefined for non-UnitValues', () => {
    expect(unitOf(100)).toBeUndefined();
    expect(unitOf(0)).toBeUndefined();
    expect(unitOf(0 as number | PxValue)).toBeUndefined();
    expect(
      unitOf(
        // @ts-expect-error  (testing bad input)
        undefined
      )
    ).toBeUndefined();
    expect(
      unitOf(
        // @ts-expect-error  (testing bad input)
        '100px'
      )
    ).toBeUndefined();
  });
});

// ===========================================================================

describe('unitVal helper', () => {
  test('creates a custom UnitNumber object', () => {
    expect((unitVal(100, 'foo') as object) instanceof UnitValue).toBe(true);
    expect(unitVal(100, 'foo').unit).toBe('foo');
    expect(unitVal(100, 'foo').toString()).toBe('100foo');
    expect(unitVal(100, 'foo') * 2).toBe(200);
  });
});

// ===========================================================================
