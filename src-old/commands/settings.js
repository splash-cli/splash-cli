/* eslint-disable indent */
require('babel-polyfill');
require('regenerator-runtime');

import frun from 'first-run';

import chalk from 'chalk';
import ms from 'ms';
import * as TableUtility from '../extra/table-utility';
import Table from 'cli-table';

import { prompt as ask } from 'inquirer';
import config from '../extra/storage';
import { clearSettings, errorHandler, highlightJSON, printBlock, pathFixer } from '../extra/utils';

export default async function settings([action, target, value]) {
	const questions = [];

	if (action) action = action.toString().toLowerCase();
	if (target) target = target.toString().toLowerCase();

	const _directory = generateQuestion('_directory', 'Default download path:', {
		default: config.get('directory'),
		filter: (input) => pathFixer(input),
	});

	const _askForLike = generateQuestion('_askForLike', 'Prompt to like the downloaded photo after download?', {
		type: 'confirm',
		default: config.get('askForLike'),
	});

	const _askForReport = generateQuestion('_askForReport', 'Prompt to report errors?', {
		type: 'confirm',
		default: config.get('shouldReportErrors'),
	});

	const _askForAutoReport = generateQuestion('_askForAutoReport', 'Auto report errors?', {
		type: 'confirm',
		default: config.get('shouldReportErrorsAutomatically'),
		when: (a) => a._askForReport === false,
	});

	const _askForCollection = generateQuestion(
		'_askForCollection',
		'Prompt to add the downloaded photo to a collection?',
		{
			type: 'confirm',
			prefix: chalk`{red {bold [BETA]}}`,
			default: config.get('askForCollection'),
		},
	);

	const _userFolder = generateQuestion('_userFolder', 'Do you want store photos by username?', {
		default: config.get('userFolder'),
		type: 'confirm',
	});

	const _confirmWallpaper = generateQuestion('_confirmWallpaper', 'Do you want to confirm each wallpaper?', {
		default: false,
		type: 'confirm',
	});

	const _updateInterval = generateQuestion('_updateInterval', 'Set the "pic of the day" cache expiration', {
		default: ms(1000 * 60 * 60 * 3),
	});

	switch (action) {
		case 'help':
		case 'how':
		case 'h':
			const commands = TableUtility.mapTableContent([
				[chalk`get`, 'null', 'get all settings'.toUpperCase()],
				[chalk`clear`, 'reset|restore', 'reset settings to default values'.toUpperCase()][
					(chalk`set {gray <settings_key>}`, 'null', 'opens menu for specific setting'.toUpperCase())
				],
				['help', 'how', 'SHOWS THIS MESSAGE'],
			]);

			const table = new Table(TableUtility.helpTableConfiguration);
			table.push(...commands);

			printBlock(chalk`{yellow ~ {bold ALIASES HELP} ~}`, '', table.toString());
			break;
		case 'get':
			if (target && target.toLowerCase() == 'picoftheday') {
				target = 'pic-of-the-day';
			}

			const user = config.get('user');

			const settings = config.get(); //target ? config.get(target) : config.get();

			if (settings['pic-of-the-day'] && settings['pic-of-the-day'].date) {
				if (settings['pic-of-the-day'].date.delay) {
					settings['pic-of-the-day'].date.delay = ms(settings['pic-of-the-day'].date.delay);
				}
			}

			settings.picOfTheDay = settings['pic-of-the-day'];
			settings.settingsPath = config.path;

			delete settings['error'];
			delete settings['keys'];
			delete settings['user'];
			delete settings['pic-of-the-day'];

			if (!settings || (target && !settings[target])) {
				return printBlock(chalk`Settings key: "{cyan ${target}}" {red {bold NOT} available}.`);
			}

			if (user && user.token) {
				settings['OAuth Token'] = user.token;
			}

			if (settings[target]) {
				let o = {};

				o[target] = settings[target];

				return printBlock(chalk`{bold {bgYellow {black SETTINGS}}}\n`, highlightJSON(o));
			}

			printBlock(chalk`{bold {bgYellow {black SETTINGS}}}\n`, highlightJSON(settings));
			break;
		case 'clear':
		case 'reset':
		case 'restore':
			ask([
				generateQuestion('confirm', chalk`Are you sure? This action is {underline NOT reversable}!`, {
					type: 'confirm',
					default: false,
				}),
			])
				.then(async ({ confirm }) => {
					if (confirm) {
						frun.clear();

						await clearSettings();

						printBlock(chalk`{yellow Settings Restored!}`);
					} else {
						printBlock(chalk`{red {bold Operation aborted!}}`);
					}
				})
				.catch((error) => {
					errorHandler(error);
				});
			break;

		case 'set':
		default:
			switch (target) {
				case 'report':
				case 'errors':
				case 'error':
					questions.push(_askForReport, _askForAutoReport);
					break;
				case 'directory':
				case 'dir':
					questions.push(_directory);
					break;
				case 'user':
				case 'user-folder':
				case 'userFolder':
				case 'groups':
					questions.push(_userFolder);
					break;
				case 'like':
				case 'askforlike':
					questions.push(_askForLike);
					break;
				case 'collection':
				case 'askforcollection':
					questions.push(_askForCollection);
					break;
				case 'confirm':
					questions.push(_confirmWallpaper);
					break;
				case 'prompt':
				case 'prompts':
					questions.push(_askForCollection, _askForLike);
					break;
				case 'update':
				case 'interval':
				case 'pic-of-the-day':
					questions.push(_updateInterval);
					break;
				default:
					questions.push(
						_userFolder,
						_askForReport,
						_askForAutoReport,
						_directory,
						_confirmWallpaper,
						_askForCollection,
						_askForLike,
						_updateInterval,
					);
					break;
			}

			const {
				_confirmWallpaper: confirmWallpaper,
				_userFolder: folder,
				_directory: dir,
				_askForCollection: collection,
				_askForLike: like,
				_updateInterval: picUpdateInterval,
				_askForAutoReport: shouldAutoReportErrors,
				_askForReport: shouldReportErrors,
			} = await ask(questions);

			let validSetting = false;

			if (confirmWallpaper !== undefined) {
				config.set('confirm-wallpaper', confirmWallpaper);
				validSetting = true;
			}

			if (shouldAutoReportErrors !== undefined) {
				config.set('shouldReportErrorsAutomatically', shouldAutoReportErrors);
				validSetting = true;
			}

			if (shouldReportErrors !== undefined) {
				config.set('shouldReportErrors', shouldReportErrors);
				validSetting = true;
			}

			if (picUpdateInterval !== undefined) {
				config.set(
					'pic-of-the-day',
					Object.assign({}, config.get('pic-of-the-day'), { date: { delay: picUpdateInterval } }),
				);
				validSetting = true;
			}

			if (folder !== undefined) {
				config.set('userFolder', folder);
				validSetting = true;
			}

			if (dir !== undefined) {
				config.set('directory', dir);
				validSetting = true;
			}

			if (collection !== undefined) {
				config.set('askForCollection', collection);
				validSetting = true;
			}

			if (like !== undefined) {
				config.set('askForLike', like);
				validSetting = true;
			}

			if (!validSetting) {
				printBlock(
					chalk`{bold {red OOPS!}}`,
					chalk`It seems that there were a {red problem} with your {cyan settings}...`,
					'',
					'{green Please try again} or {yellow report the issue} {dim (--report)}',
				);
				break;
			}

			printBlock(
				chalk`{bold Settings saved!}`,
				'Run:',
				'',
				chalk`{dim $ splash} {green settings {bold get}}`,
				'',
				'To view them.',
			);
			break;
	}
}

function generateQuestion(name, message, options = {}) {
	const fieldRequired = (input) => {
		if (input.length) return true;
		return 'Error: that field is required!';
	};

	options.validate = options.validate || fieldRequired;

	return {
		name,
		message,
		prefix: chalk.green('#'),
		...options,
	};
}
