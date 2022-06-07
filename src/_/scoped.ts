import { _scoped } from './scoped.private';

const logWarnings = process.env.NODE_ENV !== 'production';

export const scoped = (prefix?: string) => _scoped(prefix, logWarnings);
