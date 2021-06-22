import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

import chalk from 'chalk';
import Ora from 'ora';
import config from '../../extra/storage';
import { errorHandler, pathFixer } from '../../extra/utils';

const ls = promisify(fs.readdir);
const rm = promisify(fs.unlink);

const spinner = new Ora();

export default class Directory {
	static async clean() {
		const dir = Directory.getPath();

		try {
			const files = await ls(dir);

			spinner.info(chalk `Found {cyan ${files.length}} photos.`);
			console.log();



			spinner.start(chalk `Removing {cyan ${files.length}} items..`);

			for (var i = 0; i < files.length; i++) {
				const file = files[i];
				spinner.text = chalk `Removing {yellow "${file}"}`;
				if (fs.existsSync(path.join(dir, file))) rm(path.join(dir, file));
			}

			spinner.succeed(chalk `{cyan ${files.length}} files {red {bold deleted}}.`);
			console.log();

		} catch (error) {
			spinner.stop();
			return errorHandler(error);
		}
	}

	static async count() {
		const items = await ls(Directory.getPath());
		return items.filter(item => path.extname(item) === '.jpg').length;
	}

	static getPath() {
		return pathFixer(config.get('directory'));
	}
}
