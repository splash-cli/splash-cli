import Conf from 'conf';
import { defaultSettings } from './config';

const config = new Conf({ defaults: defaultSettings });

// Wrapper
// The high level logic should never now
// [Dependency Inversion](https://en.wikipedia.org/wiki/Dependency_inversion_principle)

export const has = (key) => config.has(key);
export const get = (key, defaultValue) => config.get(key, defaultValue);
export const set = (key, value) => config.set(key, value);
export const remove = (key) => config.delete(key);
export const path = config.path;
export const clear = () => config.clear();

export default { has, get, set, delete: remove, remove, path: config.path };
