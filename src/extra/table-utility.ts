import chalk from 'chalk';

/**
 * @param {any} content
 */
export const createTableContent = (content: Record<string, { aliases: string[], description: string }>) =>
	Object.keys(content).map((name) => {
		const { aliases, description } = content[name];
		return [name, aliases.length > 1 ? aliases : aliases.length ? aliases[0] : 'null', description];
	});

/**
 * @param {Array<any[]>} content
 */
export const mapTableContent = (content: [name: string, alias: string | string[], description: string][]) =>
	content.map((command) =>
		command.map((item, index) => {
			// NAME
			if (index === 0 && typeof item == 'string') {
				if (item.includes(':')) {
					return item;
				}

				return chalk`{cyan {bold ${item}}}`;
			}

			// ALIASES
			if (index === 1) {
				if (Array.isArray(item) && item.length > 1) {
					return item.map((text) => chalk`{yellow ${text}}`).join(', ');
				}

				return item === 'null' || !item ? chalk`{gray --}` : chalk`{yellow ${item as string}}`;
			}

			// DESCRIPTION
			if (index === 2  && typeof item == 'string' ) {
				return chalk`{magenta {bold ${item.toUpperCase()}}}`;
			}

			return item;
		}),
	);

export const helpTableConfiguration = {
	head: [
		chalk`{bold {black {bgWhite COMMANDS}}}`,
		chalk`{bold {black {bgYellow ALIASES}}}`,
		chalk`{bold {black {bgMagenta DESCRIPTION}}}`,
	],
	colWidths: [20, 30, 50],
};
