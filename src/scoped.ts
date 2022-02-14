let count = 1;
const rnd = () => Math.floor(100_000_000_000 * Math.random()).toString(36) + count++;

export const scoped = (prefix?: string): string =>
  (prefix ? prefix.replace(/[\s/\\#{}@():;]/g, '_') + '_' : '') + rnd();
