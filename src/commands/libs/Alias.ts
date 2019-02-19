import chalk from "chalk";

import { printBlock } from "../../extra/utils";
import { config } from "../../extra/config";

export default class Alias {
	static aliases: AliasItem[] = config.get("aliases") || [];

	static set(name: string, value: string | number) {
		if (!name || !value) {
			throw new SyntaxError(`Missing param ${name} ${value}`);
		}
		const exists = this.aliases.some((item: AliasItem) => item.name === name || item.id === value);

		if (exists) {
			return false;
		}

		this.aliases.push({ name, id: value });
		config.set("aliases", this.aliases);

		return true;
	}

	static get(name: string) {
		return this.aliases.filter((item: AliasItem) => item.name === name || item.id === name)[0];
	}

	static has(name: string) {
		const a = this.get(name);

		return a.hasOwnProperty("id") && a.hasOwnProperty("name");
	}

	static parseCollection(collection: string) {
		if (Alias.has(collection) && Alias.get(collection).hasOwnProperty("id")) {
			return Alias.get(collection).id;
		}

		return collection;
	}

	static remove(name: string) {
		const exists = this.aliases.some((item) => item.name === name || item.id === name);

		if (!exists) return false;

		const names = this.aliases.map((item) => item.name);
		const values = this.aliases.map((item) => item.id);

		let item: AliasItem | boolean = false;

		if (names.some((item) => item === name)) {
			item = this.aliases[names.indexOf(name)];
			this.aliases.splice(names.indexOf(name), 1);
		}

		if (values.some((item) => item === name)) {
			item = this.aliases[values.indexOf(name)];
			this.aliases.splice(values.indexOf(name), 1);
		}

		if (!item) return false;

		config.set("aliases", this.aliases);
		printBlock(chalk`Alias: {yellow "${item.name} : ${String(item.id)}"} removed`);

		return true;
	}
}
