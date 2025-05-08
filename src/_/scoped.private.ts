let count = 1;
const rnd = () => Math.floor(100_000_000_000 * Math.random()).toString(36) + count++;

/*#__NO_SIDE_EFFECTS__*/
export const _scoped = (prefix?: string, logWarnings?: boolean): string => {
  const safePrefix = prefix && prefix.trim().replace(/[\s/\\#{}@():;]/g, '_');
  if (prefix !== safePrefix && logWarnings) {
    console.warn('Unsafe prefix passed to es-in-css `scoped` helper', {
      prefix,
      safe_version: safePrefix,
    });
  }
  return (safePrefix ? `${safePrefix}_` : '') + rnd();
};
