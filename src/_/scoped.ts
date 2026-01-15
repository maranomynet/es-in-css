import { _scoped } from './scoped.private.js';

const logWarnings = process.env.NODE_ENV !== 'production';

/**
 * Returns a randomized/unique string token, with an optional `prefix`. These
 * tokens can be using for naming `@keyframes` or for mangled class-names, if
 * that's what you need:
 *
 * @see https://github.com/maranomynet/es-in-css/tree/v0.8#scoped-name-generator
 */
/*#__NO_SIDE_EFFECTS__*/
export const scoped = (prefix?: string) => _scoped(prefix, logWarnings);
