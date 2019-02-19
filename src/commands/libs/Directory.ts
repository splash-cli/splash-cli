import fs from "fs";
import path from "path";
import { promisify } from "util";

import chalk from "chalk";
import Ora from "ora";
import { config } from "../../extra/config";
import { errorHandler, pathFixer as fixPath } from "../../extra/utils";

const ls = promisify(fs.readdir);
const rm = promisify(fs.unlink);

const spinner = Ora();

export default class Directory {
	static async clean() {
		const dir = Directory.getPath();

		try {
			const files = await ls(dir);

			spinner.info(chalk`Found {cyan ${String(files.length)}} photos.`);
			console.log();

			spinner.start(chalk`Removing {cyan ${String(files.length)}} items..`);

			for (var i = 0; i < files.length; i++) {
				const file = files[i];
				spinner.text = chalk`Removing {yellow "${file}"}`;
				if (fs.existsSync(path.join(dir, file))) rm(path.join(dir, file));
			}

			spinner.succeed(chalk`{cyan ${String(files.length)}} files {red {bold deleted}}.`);
			console.log();
		} catch (error) {
			spinner.stop();
			return errorHandler(error);
		}
	}

	static async count() {
		const items = await ls(Directory.getPath());
		return items.filter((item) => path.extname(item) === ".jpg").length;
	}

	static getPath() {
		return fixPath(config.get("directory"));
	}
}
