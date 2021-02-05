import Conf from 'conf';
import { defaultSettings, Settings } from './config';

const config = new Conf({ defaults: defaultSettings });


// Wrapper
// The high level logic should never now
// [Dependency Inversion](https://en.wikipedia.org/wiki/Dependency_inversion_principle)

export const has = <K extends keyof Settings>(key: K): boolean => config.has(key);
export const get = <K extends keyof Settings>(key: K, defaultValue?: any): Settings[K] => config.get(key, defaultValue);
export const set = <K extends keyof Settings>(key: K, value: Settings[K]): void => config.set(key, value);
export const remove = <K extends keyof Settings>(key: K): void => config.delete(key);

export const path = config.path;
export const clear = () => config.clear();

export default { has, get, set, delete: remove, remove, path: config.path };
