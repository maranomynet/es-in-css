import o from 'ospec';

/** Testing helper */
export type StrictEquals<A, B> = A extends B ? (B extends A ? true : false) : false;

// ---------------------------------------------------------------------------

export const compareKeys = (
  input: Record<string, unknown>,
  expected: Record<string, unknown>,
  alsoAllowed: Record<string, unknown> = {}
) => {
  Object.keys(expected).forEach((token) => {
    o(input[token]).notEquals(undefined)(`missing: "${token}"`);
  });
  Object.keys(input).forEach((token) => {
    if (expected[token] === undefined && alsoAllowed[token] === undefined) {
      o(true).equals(false)(`unexpected: "${token}"`);
    }
  });
};
