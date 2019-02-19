require("babel-polyfill");
require("regenerator-runtime");

import frun from "first-run";

import chalk from "chalk";
import ms from "ms";

import { prompt as ask } from "inquirer";
import { config } from "../extra/config";
import { clearSettings, errorHandler, highlightJSON, printBlock, pathFixer } from "../extra/utils";

export default async function settings([action, target]: string[]) {
	const questions = [];

	if (action) action = action.toString().toLowerCase();
	if (target) target = target.toString().toLowerCase();

	const _directory = generateQuestion("_directory", "Default download path:", {
		default: config.get("directory"),
		filter: (input: string) => pathFixer(input),
	});

	const _askForLike = generateQuestion("_askForLike", "Prompt to like the downloaded photo after download?", {
		type: "confirm",
		default: config.get("askForLike"),
	});

	const _askForCollection = generateQuestion(
		"_askForCollection",
		"Prompt to add the downloaded photo to a collection?",
		{
			type: "confirm",
			default: config.get("askForCollection"),
		},
	);

	const _userFolder = generateQuestion("_userFolder", "Do you want store photos by username?", {
		default: config.get("userFolder"),
		type: "confirm",
	});

	const _confirmWallpaper = generateQuestion("_confirmWallpaper", "Do you want to confirm each wallpaper?", {
		default: false,
		type: "confirm",
	});

	const _updateInterval = generateQuestion("_updateInterval", 'Set the "pic of the day" update interval', {
		default: ms(1000 * 60 * 30),
	});

	switch (action) {
		case "get":
			if (target && target.toLowerCase() == "picoftheday") {
				target = "pic-of-the-day";
			}

			const settings = config.get();

			if (settings["pic-of-the-day"].date.delay) {
				settings["pic-of-the-day"].date.delay = ms(settings["pic-of-the-day"].date.delay);
			}

			settings.picOfTheDay = settings["pic-of-the-day"];
			settings.settingsPath = config.path;

			delete settings["keys"];
			delete settings["user"];
			delete settings["pic-of-the-day"];

			if (!settings || (target && !settings[target])) {
				return printBlock(chalk`Settings key: "{cyan ${target}}" {red {bold NOT} available}.`);
			}

			if (settings[target]) {
				let o: {
					[key: string]: any;
				} = {};

				o[target] = settings[target];

				return printBlock(chalk`{bold {bgYellow {black SETTINGS}}}\n`, highlightJSON(o));
			}

			printBlock(chalk`{bold {bgYellow {black SETTINGS}}}\n`, highlightJSON(settings));
			break;
		case "clear":
		case "reset":
		case "restore":
			ask([
				generateQuestion("confirm", chalk`Are you sure? This action is {underline NOT reversable}!`, {
					type: "confirm",
					default: false,
				}),
			])
				.then(({ confirm }: any) => {
					if (confirm) {
						frun.clear();

						clearSettings().then(() => {
							printBlock(chalk`{yellow Settings Restored!}`);
						});
					} else {
						printBlock(chalk`{red {bold Operation aborted!}}`);
					}
				})
				.catch((error: any) => {
					errorHandler(error);
				});
			break;

		case "set":
		default:
			switch (target) {
				case "directory":
				case "dir":
					questions.push(_directory);
					break;
				case "user":
				case "user-folder":
				case "userFolder":
				case "groups":
					questions.push(_userFolder);
					break;
				case "like":
				case "askforlike":
					questions.push(_askForLike);
					break;
				case "collection":
				case "askforcollection":
					questions.push(_askForCollection);
					break;
				case "confirm":
					questions.push(_confirmWallpaper);
					break;
				case "prompt":
				case "prompts":
					questions.push(_askForCollection, _askForLike);
					break;
				case "update":
				case "interval":
				case "pic-of-the-day":
					questions.push(_updateInterval);
					break;
				default:
					questions.push(_userFolder, _directory, _confirmWallpaper, _askForCollection, _askForLike, _updateInterval);
					break;
			}

			const {
				_confirmWallpaper: confirmWallpaper,
				_userFolder: folder,
				_directory: dir,
				_askForCollection: collection,
				_askForLike: like,
				_updateInterval: picUpdateInterval,
			} = await ask(questions);

			let validSetting = false;

			if (confirmWallpaper !== undefined) {
				config.set("confirm-wallpaper", confirmWallpaper);
				validSetting = true;
			}

			if (picUpdateInterval !== undefined) {
				config.set("pic-of-the-day", {
					...config.get("pic-of-the-day"),
					date: { delay: picUpdateInterval },
				});
				validSetting = true;
			}

			if (folder !== undefined) {
				config.set("userFolder", folder);
				validSetting = true;
			}

			if (dir !== undefined) {
				config.set("directory", dir);
				validSetting = true;
			}

			if (collection !== undefined) {
				config.set("askForCollection", collection);
				validSetting = true;
			}

			if (like !== undefined) {
				config.set("askForLike", collection);
				validSetting = true;
			}

			if (!validSetting) {
				printBlock(
					chalk`{bold {red OOPS!}}`,
					chalk`It seems that there were a {red problem} with your {cyan settings}...`,
					"",
					"{green Please try again} or {yellow report the issue} {dim (--report)}",
				);
				break;
			}

			printBlock(
				chalk`{bold Settings saved!}`,
				"Run:",
				"",
				chalk`{dim $ splash} {green settings {bold get}}`,
				"",
				"To view them.",
			);
			break;
	}
}

function generateQuestion(name: string, message: string, options: any = {}): any {
	const fieldRequired = (input: string) => {
		if (input.length) return true;
		return "Error: that field is required!";
	};

	options.validate = options.validate || fieldRequired;
	return { name, message, prefix: chalk.green("#"), ...options };
}
