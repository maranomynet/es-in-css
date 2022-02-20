import { color } from './colors';
import { UnitValue } from './units';

const isStr = (value: unknown): value is string => typeof value === 'string';

const getNumberType = (value: unknown): string | undefined => {
  const number =
    typeof value === 'number'
      ? value
      : isStr(value) && /^[-+]?\d*.?\d+$/.test(value.trim())
      ? Number(value)
      : undefined;
  if (number == null) {
    return '';
  }
  return number === 0 ? 'zero' : 'number';
};

const getStringUnit = (value: unknown): string => {
  if (!isStr(value)) {
    return '';
  }
  const m = value.trim().match(/^[-+]?\d*\.?\d+(%|[a-z]+)$/i) as [string, string] | null;
  return m ? m[1].toLowerCase() : '';
};

const getUnitValueUnit = (value: unknown) =>
  value instanceof UnitValue ? value.unit : '';

// ---------------------------------------------------------------------------

const sizeUnits = new Set([
  'px',
  'rem',
  'em',
  'ch',
  'ex',
  'vw',
  'vh',
  'vmin',
  'vmax',
  'cm',
  'in',
  'mm',
  'pt',
  'pc',
  'm',
]);
const timeUnits = new Set(['ms', 's']);
const angleUnits = new Set(['deg', 'turn', 'rad', 'grad']);

const getUnitType = (value: unknown): string => {
  const unit = getStringUnit(value) || getUnitValueUnit(value);

  if (!unit) {
    return '';
  }
  if (unit === '%') {
    return 'percent';
  }
  if (sizeUnits.has(unit)) {
    return 'size:' + unit;
  }
  if (timeUnits.has(unit)) {
    return 'time:' + unit;
  }
  if (angleUnits.has(unit)) {
    return 'angle:' + unit;
  }
  return '';
};

// ---------------------------------------------------------------------------

const specialColors = new Set(['currentColor']);

const getColorType = (value: unknown): string => {
  if (value instanceof color) {
    return 'color';
  }
  if (isStr(value)) {
    if (specialColors.has(value.trim())) {
      return 'color';
    }
    try {
      color(value);
      return 'color';
    } catch (e) {}
  }
  return '';
};

// ===========================================================================

export const resolveType = (value: unknown) => {
  const type = getNumberType(value) || getUnitType(value) || getColorType(value);
  return type || 'unknown';
};
