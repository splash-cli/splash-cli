require("babel-polyfill");
require("regenerator-runtime");

import chalk from "chalk";
import figures from "figures";

import { printBlock } from "../extra/utils";
import { config } from "../extra/config";
import Alias from "./libs/Alias";
import { AliasItem } from "../../declarations/global";

export default function aliasCMD([action, alias, aliasID]: any[]): void {
	const aliases: AliasItem[] = config.get("aliases") || [];

	switch (action) {
		case "delete":
		case "remove":
			const removed = Alias.remove(alias);
			if (removed === false)
				printBlock(chalk`{red {bold Error:}} Alias {yellow "${alias}"} not found.`, config.get("aliases"));
			break;
		case "set":
			let created = false;
			if (/[a-z\-\_]\=[0-9]{1,7}/.test(alias)) {
				const [name, id] = alias.split(/\=|\/|\:/g);
				created = Alias.set(name, id);
				printBlock(chalk`{bold Alias created!}`, "", chalk`{yellow ${name}: ${id}}`);
			} else if (alias && aliasID) {
				aliasID = String(aliasID);
				created = Alias.set(alias, aliasID);
				printBlock(chalk`{bold Alias created!}`, "", chalk`{yellow ${alias}: ${aliasID}}`);
			} else {
				return printBlock(
					chalk`{bold {red Invalid alias!}}`,
					"",
					chalk`Please use {underline the following syntax}:`,
					"",
					chalk`{dim $ splash} {green alias} {yellow name=id}`,
					chalk`{dim $ splash} {green alias} {yellow name id}`,
				);
			}

			if (!created)
				return printBlock(
					chalk`{bold {red Error:}} Duplicate! An alias with these parameters already exists!`,
					chalk`If you want replace it use {yellow 'alias remove'}`,
					"",
					...aliases.map((item) => chalk`{yellow ${item.name}}: ${String(item.id)}`),
				);

			break;
		case "get":
			if (!alias || alias === "all") {
				return printBlock(
					chalk`{cyan Aliases: (${String(aliases.length)})}`,
					"",
					...aliases.map((item) => chalk`{dim ${figures.pointer}} {yellow ${item.name}}: ${String(item.id)}`),
				);
			}

			alias = Alias.get(alias);

			if (!alias)
				return printBlock(
					chalk.bold.red("Invalid Alias"),
					"",
					"",
					chalk`{cyan Aliases: (${String(aliases.length)})}`,
					"",
					...aliases.map((item) => chalk`{dim ${figures.pointer}} {yellow ${item.name}}: ${String(item.id)}`),
				);

			printBlock(chalk`{bold {yellow "${alias.name}"}}: ${alias.id}`);
			break;
		case "help":
		case "how":
		case "h":
			printBlock(
				"ALIASES HELP",
				"",
				chalk`
				{bold {black {bgWhite COMMANDS}}}   			{bold {black {bgYellow ALIASES}}} 		{bold {black {bgWhite DESCRIPTION}}}

				{cyan {bold get [alias]}}			{dim none}			  {dim GET AN ALIAS OR ALL ALIASES}
				{cyan {bold set <alias> <id>}}		{dim none}			  {dim SET AN ALIAS}
				{cyan {bold help}} 				{yellow "how"}			  {dim SHOWS THIS MESSAGE}
			`
					.split("\n")
					.map((item) => `  ${item.trim()}`)
					.join("\n"),
			);
			break;
		default:
			if (!action) return aliasCMD(["help"]);

			printBlock(chalk`Invalid command "{red ${action}}"`, "Allowed actions are:", " - set", " - get");
			break;
	}
}
