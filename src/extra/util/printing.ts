import chalk from 'chalk'
import figures from 'figures'

/**
 * Log utilty
 */
export const logger = {
	info: console.log.bind(console, chalk.cyan(figures.info)),
	warn: console.log.bind(console, chalk.yellow(figures.warning)),
	error: console.log.bind(console, chalk.red(figures.cross)),
};

/**
 * @name printBlock
 * @description Clear the output before log
 */
export const printBlock = (...lines: string[]): void => {
	console.clear();
	console.log();

	if ( lines.length ) {
		lines.forEach(l => console.log(l))
	} else {
		console.log(lines[0])
	}

	console.log()
}
