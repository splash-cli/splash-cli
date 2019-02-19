import chalk from "chalk";

import Directory from "./libs/Directory";
import { printBlock } from "../extra/utils";

export default async function dirCMD([cmd]: string[]) {
	switch (cmd) {
		case "clean":
			return await Directory.clean();
		case "get":
			return printBlock(chalk`That's the path: "{yellow {underline ${Directory.getPath()}}}"`);
		case "count":
			return printBlock(chalk`Found {cyan ${String(await Directory.count())}} photos.`);
		case "help":
		case "h":
		case "how":
			printBlock(
				"DIR HELP",
				"",
				chalk`
				{bold {black {bgWhite COMMANDS}}}   	{bold {black {bgYellow ALIASES}}} 		{bold {black {bgWhite DESCRIPTION}}}

				{cyan {bold get}}		{dim none}			  {dim GET DOWNLOADED PHOTOS LOCATION}
				{cyan {bold count}} 	{dim none}			  {dim COUNTS ALL THE DOWNLOADED PHOTOS}
				{cyan {bold clean}} 	{dim none}	  {dim DELETE ALL THE DOWNLOADED PHOTOS}
				{cyan {bold help}} 		{yellow "how"}			  {dim SHOWS THIS MESSAGE}
			`
					.split("\n")
					.map((item) => `  ${item.trim()}`)
					.join("\n"),
			);
			break;
		default:
			if (!cmd) return dirCMD(["help"]);
			printBlock(chalk`Unknown command "{red {bold ${cmd}}}"`);
	}
}
