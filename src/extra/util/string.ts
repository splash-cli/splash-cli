import os from 'os'
import chalk from 'chalk'

/**
 * @description Check if the given string is a path
 * @param {String} path - A Path
 */
export const isPath = (path: string): boolean =>
	/([a-z]\:|)(\w+|\~+|\.|)\\\w+|(\w+|\~+|)\/\w+/i.test(path);

	/**
 * @description Replaces '~' with home folder
 * @param {String} path
 */
export const pathFixer = (path: string): string => {
	var tester = /^\~/g;

	if (tester.test(path)) {
		path = path.replace(tester, os.homedir());
	}

	return path;
}


/**
 * @description Highlight json
 * @param {Object} data
 */
export const highlightJSON = (data: any): string => {
	let jsonString = JSON.stringify(data, null, 2);

	jsonString = jsonString
		.replace(/[\{|\}|\,|\:|\[|\]]+/g, chalk`{dim $&}`)
		.replace(/\".*?\"/g, chalk`{yellow $&}`)
		.replace(/(\s+)(\d+)/g, chalk`$1{cyan $2}`)
		.replace(/null|undefined/gi, chalk`{dim $&}`)
		.replace(/true|false/gi, chalk`{magenta $&}`);

	return jsonString;
}
