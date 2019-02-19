import chalk from "chalk";
import tlink from "terminal-link";
import { errorHandler, printBlock, warnIfNotLogged } from "../extra/utils";
import { CollectionManager } from "./libs/Collection";

// TODO: finish to write this command
export default async function userCommand([cmd, input]: string[]): Promise<void> {
	warnIfNotLogged();

	try {
		if (cmd) cmd = cmd.toString().toLowerCase();

		switch (cmd) {
			case "get":
				let collection: any = await CollectionManager.get(input);

				collection = await collection.info();

				printBlock(chalk`
  {yellow {bold ${collection.title}}} [{cyan ${collection.total_photos}}]
  by {underline ${collection.user.name}} a.k.a {underline @${collection.user.username}}

  View more ${tlink("here", collection.links.html)}
`);

				break;
			case "delete":
				const { statusCode, statusMessage } = await CollectionManager.delete(input);
				if (statusCode === 204) return printBlock(`Collection ${input} deleted successfully!`);
				return printBlock(`${statusCode} - ${statusMessage}`);
				break;
			case "help":
			case "h":
			case "how":
				printBlock(
					"DIR HELP",
					"",
					chalk`
						{bold {black {bgWhite COMMANDS}}}   			{bold {black {bgYellow ALIASES}}} 		{bold {black {bgWhite DESCRIPTION}}}

						{cyan {bold get}}    {yellow <collection_id>} 	{dim none}	  {dim GET COLLECTION INFOS}
						{cyan {bold delete}} {yellow <collection_id>}	{dim none}	  {dim COUNTS ALL THE DOWNLOADED PHOTOS}
						{cyan {bold help}} 				{yellow "how"}	  {dim SHOWS THIS MESSAGE}
					`
						.split("\n")
						.map((item) => `  ${item.trim()}`)
						.join("\n"),
				);
				break;
			default:
				if (!cmd) return userCommand(["help"]);
				printBlock(chalk`Unknown command "{red {bold ${cmd}}}"`);
		}
	} catch (error) {
		errorHandler(error);
	}
}
