type Fn<T, U> = (arg: T) => U;

export const mapObject = <T, U>(object: T, mapper: Fn<T, U>): U => mapper(object)

/**
 * @description Try to parse json
 * @param {String} string
 */
export const tryParse = (str: string): string | any => {
	try {
		return JSON.parse(str);
	} catch (error) {
		return str;
	}
}
