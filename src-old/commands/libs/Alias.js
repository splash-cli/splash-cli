import chalk from 'chalk';

import { printBlock } from '../../extra/utils';
import config from '../../extra/storage';

export default class Alias {
	static aliases = config.get('aliases') || [];

	static set(name, value) {
		if (!name || !value) {
			throw new SyntaxError(`Missing param ${name} ${value}`);
		}
		const exists = this.aliases.some((item) => item.name === name || item.id === value);

		if (exists) {
			return false;
		}

		this.aliases.push({ name, id: value });
		config.set('aliases', this.aliases);

		return true;
	}

	static get(name) {
		return this.aliases.find((item) => item.name === name || item.id === name);
	}

	static has(name) {
		const a = this.get(name);
		if (!a) return false;
		return a.hasOwnProperty('id') && a.hasOwnProperty('name');
	}

	static parseCollection(collection) {
		if (Alias.has(collection) && Alias.get(collection).hasOwnProperty('id')) {
			return Alias.get(collection).id;
		}

		return collection;
	}

	static remove(name) {
		const exists = this.aliases.some((item) => item.name === name || item.id === name);

		if (!exists) return false;

		const names = this.aliases.map((item) => item.name);
		const values = this.aliases.map((item) => item.id);

		let item = false;

		if (names.some((item) => item === name)) {
			item = this.aliases[names.indexOf(name)];
			this.aliases.splice(names.indexOf(name), 1);
		}

		if (values.some((item) => item === name)) {
			item = this.aliases[values.indexOf(name)];
			this.aliases.splice(values.indexOf(name), 1);
		}

		if (!item) return false;

		config.set('aliases', this.aliases);
		printBlock(chalk`Alias: {yellow "${item.name} : ${item.id}"} removed`);

		return true;
	}
}
