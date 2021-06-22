import chalk from 'chalk';

import Directory from './libs/Directory';
import { printBlock } from '../extra/utils';
import * as TableUtility from '../extra/table-utility';
import Table from 'cli-table';

export default async function dirCMD([cmd]) {
	switch (cmd) {
	case 'clean':
		return await Directory.clean();
	case 'get':
		return printBlock(chalk`That's the path: "{yellow {underline ${Directory.getPath()}}}"`);
	case 'count':
		return printBlock(chalk`Found {cyan ${await Directory.count()}} photos.`);
	case 'help':
	case 'h':
	case 'how':
		const commands = TableUtility.mapTableContent([
			['get', 'null', 'GET THE `splash-cli` DOWNLOADS FOLDER PATH'],
			['count', 'null', 'COUNTS ALL THE DOWNLOADED PHOTOS'],
			['clean', 'null', 'DELETE ALL THE DOWNLOADED PHOTOS'],
			['help', 'how', 'SHOWS THIS MESSAGE'],
		]);

		const table = new Table(TableUtility.helpTableConfiguration);
		table.push(...commands);

		printBlock(chalk`{yellow ~ {bold DIR HELP} ~}`, '', table.toString());
		break;
	default:
		if (!cmd) return dirCMD(['help']);
		printBlock(chalk`Unknown command "{red {bold ${cmd}}}"`);
	}
}
