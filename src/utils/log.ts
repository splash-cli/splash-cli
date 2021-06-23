import chalk from 'chalk'
import figures from 'figures'

const printBlock = (...lines: any[]): void => {
  console.clear()
  console.log();

  for ( const line of lines ) {
    console.log(line)
  }

  console.log();
}

export const Logger = {
	info: console.log.bind(console, chalk.cyan(figures.info)),
	warn: console.log.bind(console, chalk.yellow(figures.warning)),
	error: console.log.bind(console, chalk.red(figures.cross)),
  printBlock,
};
