import chalk from 'chalk';

/**
 * @param {any} content
 */
export const createTableContent = (content) =>
	Object.keys(content).map((name) => {
		const { aliases, description } = content[name];
		return [name, aliases.length > 1 ? aliases : aliases.length ? aliases[0] : 'null', description];
	});

/**
 * @param {Array<any[]>} content
 */
export const mapTableContent = (content) =>
	content.map((command) =>
		command.map((item, index) => {
			if (index === 0) {
				if (item.includes(':')) {
					return item;
				}

				return chalk`{cyan {bold ${item}}}`;
			}

			if (index === 1) {
				if (Array.isArray(item) && item.length > 1) {
					return item.map((text) => chalk`{yellow ${text}}`).join(', ');
				}

				return item === 'null' || !item ? chalk`{gray --}` : chalk`{yellow ${item}}`;
			}

			if (index === 2) {
				return chalk`{magenta {bold ${item.toUpperCase()}}}`;
			}

			return item;
		}),
	);

/**
 * @param {any} content
 */
export const createMappedTableContent = (content) => mapTableContent(createTableContent(content));

export const helpTableConfiguration = {
	head: [
		chalk`{bold {black {bgWhite COMMANDS}}}`,
		chalk`{bold {black {bgYellow ALIASES}}}`,
		chalk`{bold {black {bgMagenta DESCRIPTION}}}`,
	],
	colWidths: [20, 30, 50],
};
