export class Unit<T> {
  constructor(value: T | Unit<T>, unit: string) {
    this.value = 'value' in value ? value.value : value;
    this.unit = unit;
  }

  value: T;
  unit: string;

  toString() {
    return this.value + this.unit;
  }
  valueOf() {
    return this.value + this.unit;
  }
}

// ---------------------------------------------------------------------------

export class PxValue extends Unit<number> {
  constructor(value: number | PxValue) {
    super(value, 'px');
  }
}

export class RemValue extends Unit<number> {
  constructor(value: number | RemValue) {
    super(value, 'rem');
  }
}

export class EmValue extends Unit<number> {
  constructor(value: number | EmValue) {
    super(value, 'em');
  }
}

export class ChValue extends Unit<number> {
  constructor(value: number | ChValue) {
    super(value, 'ch');
  }
}

export class ExValue extends Unit<number> {
  constructor(value: number | ExValue) {
    super(value, 'ex');
  }
}

export class PctValue extends Unit<number> {
  constructor(value: number | PctValue) {
    super(value, '%');
  }
}

export class VwValue extends Unit<number> {
  constructor(value: number | VwValue) {
    super(value, 'vw');
  }
}

export class VhValue extends Unit<number> {
  constructor(value: number | VhValue) {
    super(value, 'vh');
  }
}

export class VminValue extends Unit<number> {
  constructor(value: number | VminValue) {
    super(value, 'vmin');
  }
}

export class VmaxValue extends Unit<number> {
  constructor(value: number | VmaxValue) {
    super(value, 'vmax');
  }
}

export class MsValue extends Unit<number> {
  constructor(value: number | MsValue) {
    super(value, 'ms');
  }
}

export class MmValue extends Unit<number> {
  constructor(value: number | MmValue) {
    super(value, 'mm');
  }
}
