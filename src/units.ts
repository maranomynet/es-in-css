export class Unit {
  constructor(value: number | Unit, unit: string) {
    this.value = typeof value === 'number' ? value : value.value;
    this.unit = unit;
  }

  value: number;
  unit: string;

  toString() {
    return this.value + this.unit;
  }
  valueOf() {
    return this.value + this.unit;
  }
}

// ---------------------------------------------------------------------------

export class PxValue extends Unit {
  constructor(value: number | PxValue) {
    super(value, 'px');
  }
}

export class RemValue extends Unit {
  constructor(value: number | RemValue) {
    super(value, 'rem');
  }
}

export class EmValue extends Unit {
  constructor(value: number | EmValue) {
    super(value, 'em');
  }
}

export class ChValue extends Unit {
  constructor(value: number | ChValue) {
    super(value, 'ch');
  }
}

export class ExValue extends Unit {
  constructor(value: number | ExValue) {
    super(value, 'ex');
  }
}

export class PctValue extends Unit {
  constructor(value: number | PctValue) {
    super(value, '%');
  }
}

export class VwValue extends Unit {
  constructor(value: number | VwValue) {
    super(value, 'vw');
  }
}

export class VhValue extends Unit {
  constructor(value: number | VhValue) {
    super(value, 'vh');
  }
}

export class VminValue extends Unit {
  constructor(value: number | VminValue) {
    super(value, 'vmin');
  }
}

export class VmaxValue extends Unit {
  constructor(value: number | VmaxValue) {
    super(value, 'vmax');
  }
}

export class MsValue extends Unit {
  constructor(value: number | MsValue) {
    super(value, 'ms');
  }
}

export class CmValue extends Unit {
  constructor(value: number | CmValue) {
    super(value, 'cm');
  }
}
