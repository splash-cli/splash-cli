require('babel-polyfill');
require('regenerator-runtime');

const pkg = require('../../package.json');
const Sentry = require('@sentry/node');

import path from 'path';
import os from 'os';
import { URL } from 'url';

import fuzzy from 'fuzzy';
import { prompt } from 'inquirer';
import isMonth from '@splash-cli/is-month';
import showCopy from '@splash-cli/show-copy';
import chalk from 'chalk';
import figures from 'figures';
import got from 'got';
import isImage from 'is-image';
import mkdirp from 'mkdirp';
import Ora from 'ora';
import RemoteFile from 'simple-download';
import terminalLink from 'terminal-link';
import wallpaper from 'wallpaper';
import normalize from 'normalize-url';

import { config, defaultSettings, keys } from './config';

import Alias from '../commands/libs/Alias';
import User from '../commands/libs/User';
import { Collection } from '../commands/libs/Collection';

/**
 * @description Generate auth URL
 * @param  {...String} scopes
 */
export function generateAuthenticationURL(...listOfScopes: string[]) {
	const url = new URL('https://unsplash.com/oauth/authorize');
	const validScopes = [
		'public',
		'read_user',
		'write_user',
		'read_photos',
		'write_photos',
		'write_likes',
		'write_followers',
		'read_collections',
		'write_collections',
	];

	const scopes = listOfScopes.filter((item) => validScopes.indexOf(item) >= 0).join('+');

	url.searchParams.set('client_id', keys.client_id);
	url.searchParams.set('redirect_uri', keys.redirect_uri);
	url.searchParams.set('response_type', 'code');

	return url.href + '&scope=' + scopes;
}

/**
 * @description Authenticate the user.
 * @param {Object} params
 */
export async function authenticate({ client_id, client_secret, code, redirect_uri }: any = {}) {
	const url = new URL('https://unsplash.com');
	url.pathname = '/oauth/token';

	const payload = {
		client_id: client_id,
		client_secret: client_secret,
		redirect_uri,
		grant_type: 'authorization_code',
		code: code,
	};

	return await got(normalize(url.href), {
		method: 'POST',
		body: JSON.stringify(payload, null, 2),
		headers: {
			'Content-Type': 'application/json',
		},
	});
}

export async function grabKeys(updateConfig = false) {
	const url = new URL('https://keys.splash-cli.app');

	const response = await got(normalize(url.href), {
		method: 'GET',
		json: true,
		headers: {
			Accept: 'application/json',
		},
	});

	if (updateConfig) {
		config.set('client_id', response.body.client_id);
		config.set('client_secret', response.body.client_secret);
	}

	return response;
}

/**
 * @description Make an authenticated request (with bearer)
 * @param {String} endpoint
 * @param {Object} options
 */
export async function authenticatedRequest(endpoint: string, options: any = {}) {
	warnIfNotLogged();

	if (options.json) {
		options.headers = {
			...options.headers,
			'Content-Type': 'application/json',
		};

		delete options.json;
	}

	const { token } = config.get('user');
	const httpOptions = {
		...options,
		headers: {
			...options.headers,
			Authorization: `Bearer ${token}`,
		},
	};

	const response = await got(normalize(`https://api.unsplash.com/${endpoint}`), httpOptions);

	switch (response.statusCode) {
		case 200:
		case 201:
		case 203:
		case 404:
		case 500:
		case 302:
		case 422:
			return tryParse(response.body);
		default:
			return response;
	}
}

/**
 * Check if everything works fine with the user settings.
 */
export function checkUserAuth() {
	const { token, profile: user } = config.get('user');

	if (!token) return false;

	if (!user) {
		authenticatedRequest('me')
			.then(({ body }) => JSON.parse(body))
			.then((usr) => config.set('user', Object.assign({ profile: usr }, config.get('user'))))
			.catch(errorHandler);
	}

	return true;
}

/**
 * Warn the user if is not logged.
 */
export function warnIfNotLogged() {
	if (!config.has('user') || !config.get('user').token) {
		return printBlock(chalk`Please log in.`);
	}

	return true;
}

/**
 * @description Try to parse json
 * @param {String} string
 */
export function tryParse(str: string) {
	try {
		return JSON.parse(str);
	} catch (error) {
		return str;
	}
}

/**
 * @description Restore default settings
 */
export async function clearSettings() {
	const settingsList = Object.keys(defaultSettings);

	for (let i = 0; i < settingsList.length; i++) {
		const setting: any = settingsList[i];

		if (config.has(setting)) {
			config.delete(setting);
			config.set(setting, defaultSettings[setting as keyof SplashCLI.Settings]);
		}
	}

	return config.get() === defaultSettings;
}

/**
 * @description Parse a collection alias
 * @param {String} alias
 */
export const parseCollection = (alias: string) => {
	const exists = Alias.has(alias);

	if (exists) return Alias.get(alias).id;

	return alias;
};

export async function reportPrompt(error: Error) {
	const { shouldReport } = await prompt({
		name: 'shouldReport',
		message: 'Report the error?',
		type: 'confirm',
		default: true,
		when: () => !config.get('shouldReportErrorsAutomatically'),
	});

	if (shouldReport || config.get('shouldReportErrorsAutomatically') === true) {
		const event_id = Sentry.captureException(error);
		config.set('lastEventId', event_id);
	}
}

/**
 * @description Beautify any type of error
 * @param {Error} error
 */
export async function errorHandler(error: Error) {
	config.set('lastError', error);

	const spinner = new Ora();
	spinner.stop();
	printBlock(
		'',
		chalk`{bold {red OOps! We got an error!}}`,
		'',
		chalk`Please report it: {underline {green ${terminalLink(
			'on GitHub',
			'https://github.com/splash-cli/splash-cli/issues',
		)}}}`,
		'',
		chalk`{yellow {bold Splash Error}:}`,
		'',
	);

	if (config.get('shouldReportErrors') === true || config.get('shouldReportErrorsAutomatically'))
		await reportPrompt(error);

	// Log the error
	logger.error(error);
}

/**
 * @description Check if the given string is a path
 * @param {String} p - A Path
 */
export function isPath(p: string) {
	return /([a-z]\:|)(\w+|\~+|\.|)\\\w+|(\w+|\~+|)\/\w+/i.test(p);
}

export const getCollection = async () => {
	let list = await User.getCollections();
	list = list.map(({ title, id, curated, updatedAt, description }: any) => ({
		id,
		title,
		curated,
		updatedAt,
		description,
	}));

	const searchCollections = (collections: any, defaultValue = '') => (answers: any, input: any) => {
		input = input || defaultValue || '';

		return new Promise(async (resolve) => {
			collections = collections.map((item: any) => chalk`{dim [${item.id}]} {yellow ${item.title}}`);
			const fuzzyResult = fuzzy.filter(input, collections);
			resolve(fuzzyResult.map((el) => el.original));
		});
	};

	const { collection_id } = await prompt([
		{
			name: 'collection_id',
			type: 'autocomplete',
			message: 'Please choose a collection',
			source: (answers: any, input: any) => searchCollections(list)(answers, input),
			filter: (value) => parseInt(value.match(/\[(\d+)\].*?/i)[1].trim()),
		},
	]);

	return collection_id;
};

/**
 * @description Download a photo
 *
 * @param {Object} photo
 * @param {String} url
 * @param {Object} flags
 * @param {Bool} setAsWP
 */
export async function download(photo: any, url: string, flags: SplashCLI.Flags, setAsWP: boolean = true) {
	let dir = config.get('directory');

	if (config.get('userFolder') === true) {
		dir = path.join(config.get('directory'), `@${photo.user.username}`);
	}

	mkdirp.sync(dir);

	const sentences = [
		'Making something awesome',
		'Something is happening...',
		'Magic stuff',
		'Doing something... else',
		'You know, backend stuff..',
	];

	const spinner = new Ora({
		text: sentences[Math.floor(Math.random() * (sentences.length - 1))],
		color: 'yellow',
		spinner: isMonth('december') ? 'christmas' : 'earth',
	});

	if (flags.quiet) {
		console.log = console.info = () => {};
		spinner.start = spinner.fail = () => {};
	}

	spinner.start();

	let filename = path.join(dir, `${photo.id}.jpg`);

	if (flags.save && isPath(flags.save)) {
		const savePath = pathFixer(flags.save);

		filename = path.join(savePath, `${photo.id}.jpg`);

		if (isImage(flags.save)) {
			filename = savePath;
		}
	}

	const remotePhoto = new RemoteFile(url, filename);

	remotePhoto.download().then(async (fileInfo: any) => {
		config.set('counter', config.get('counter') + 1);

		if (!flags.quiet) spinner.succeed();
		if (setAsWP && !flags.save) {
			if (flags.screen || flags.scale) {
				if (process.platform !== 'darwin') {
					console.log();
					logger.warn(
						chalk`{dim > Sorry, this function ({underline ${
							flags.screen ? '"screen"' : '"scale"'
						}}) is available {bold only on MacOS}}`,
					);
					console.log();
				}
			}

			let screen;
			if (flags.screen) {
				if (!/[0-9|main|all]+/g.test(flags.screen)) {
					screen = false;
				} else {
					screen = flags.screen;
				}
			}

			let scale;
			if (flags.scale) {
				if (!/[auto|fill|fit|stretch|center]/g.test(flags.scale)) {
					scale = false;
				} else {
					scale = flags.scale;
				}
			}

			if (scale) {
				await wallpaper.set(filename, { scale });
			} else if (screen) {
				await wallpaper.set(filename, { screen });
			} else if (scale && screen) {
				await wallpaper.set(filename, { screen, scale });
			} else {
				await wallpaper.set(filename);
			}
		} else {
			console.log();
			printBlock(chalk`Picture stored at: {underline ${path.join(fileInfo.dir, fileInfo.base)}}`);
			console.log();
		}

		console.log();

		showCopy(photo, flags.info);

		console.log();

		if (!config.has('user')) {
			logger.info(chalk`{dim Login to like this photo.}`);
			console.log();
			return;
		} else if (photo.liked_by_user) {
			logger.info(chalk`{dim Photo liked by user.}`);
			console.log();
		}

		if (flags.save) return;

		const promptLike = config.get('askForLike');
		const promptCollection = config.get('askForCollection');
		const confirmWallpaper = config.get('confirm-wallpaper');

		const { liked, confirmed, addToCollection } = await prompt([
			{
				name: 'confirmed',
				message: 'Keep this wallpaper?',
				type: 'confirm',
				default: true,
				when: () => confirmWallpaper == true,
			},
			{
				name: 'liked',
				message: 'Do you like this photo?',
				type: 'confirm',
				default: true,
				when: () => promptLike && !photo.liked_by_user && !flags.quiet,
			},
			{
				name: 'addToCollection',
				message: 'Do you want add this photo to a collection?',
				type: 'confirm',
				default: false,
				when: () => promptCollection && !flags.quiet,
			},
		]);

		if (!confirmed && confirmWallpaper) {
			const lastWP = config.get('lastWP');
			wallpaper.set(lastWP);
			return;
		}

		const currentWallpaper = await wallpaper.get();
		config.set('lastWP', currentWallpaper);

		if (liked === true && promptLike) {
			const id = photo._id || photo.id;

			try {
				await User.likePhoto(id);

				console.log();
				console.log('Photo liked.');
			} catch (error) {
				errorHandler(error);
			}
		}

		if (addToCollection === true && promptCollection) {
			const id = photo._id || photo.id;

			try {
				const collection_id = await getCollection();
				const collection = new Collection(collection_id);

				await collection.addPhoto(id);

				console.log();
				console.log('Photo added to the collection.');
			} catch (error) {
				errorHandler(error);
			}
		}
	});
}

/**
 * Log utilty
 */
export const logger = {
	info: console.log.bind(console, chalk.cyan(figures.info)),
	warn: console.log.bind(console, chalk.yellow(figures.warning)),
	error: console.log.bind(console, chalk.red(figures.cross)),
};

/**
 * @description Highlight json
 * @param {Object} data
 */
export function highlightJSON(data: object) {
	let jsonString = JSON.stringify(data, null, 2);

	jsonString = jsonString.replace(/[\{|\}|\,|\:|\[|\]]+/g, chalk`{dim $&}`);
	jsonString = jsonString.replace(/\".*?\"/g, chalk`{yellow $&}`);
	jsonString = jsonString.replace(/(\s+)(\d+)/g, chalk`$1{cyan $2}`);
	jsonString = jsonString.replace(/null|undefined/gi, chalk`{dim $&}`);
	jsonString = jsonString.replace(/true|false/gi, chalk`{magenta $&}`);

	return jsonString;
}

/**
 * @name printBlock
 * @description Clear the output before log
 */
export function printBlock(...args: any[]) {
	for (var _len = arguments.length, lines = Array(_len), _key = 0; _key < _len; _key++) {
		lines[_key] = arguments[_key];
	}

	console.clear();
	console.log();

	if (lines.length > 1) {
		for (var i = 0; i < lines.length; i++) {
			var line = lines[i];
			console.log(line);
		}
	} else {
		console.log(lines[0]);
	}

	console.log();
}

/**
 * @description Replaces '~' with home folder
 * @param {String} path
 */
export function pathFixer(path: string) {
	var tester = /^~.*?/g;

	if (tester.test(path)) {
		path = path.replace(tester, os.homedir());
	}

	return path;
}

/**
 *
 * @name addTimeTo
 * @description Add an amount of milliseconds to a date
 *
 * @param {Date} date
 * @param {Number} time
 */
export const addTimeTo = (date: Date, time: number) => new Date(date.getTime() + time);

/**
 * @name now
 * @description Get the current date
 */
export const now = () => new Date();

/**
 * @name confirmWithExtra
 *
 * @param {String} name
 * @param {String} message
 * @param {String} extra
 * @param {Object} options
 */
export const confirmWithExtra = (name: string, message: string, extra: string, options: any) => {
	return {
		name,
		message,
		default: `${options.default === 0 ? 'Y' : 'y'}/${options.default === 1 ? 'n' : 'N'}/${
			options.default === 2 ? extra.toUpperCase() : extra
		}`,
		when: options.when,
		validate: (input: any) => new RegExp(`(^y$|^yes$)|(^n$|^no$|^nope$)|(^${extra}$)`, 'gi').test(input),
		filter: (input: any) => input.toLowerCase(),
	};
};

/**
 * @name getSystemInfos
 */
export const getSystemInfos = () => {
	const getRelease = (): any => {
		const names: { [key: number]: string } = {
			12: 'MacOS Mountain Lion',
			13: 'MacOS Mavericks',
			14: 'MacOS Yosemite',
			15: 'MacOS El Capitan',
			16: 'MacOS Sierra',
			17: 'MacOS High Sierra',
			19: 'MacOS Catalina',
			18: 'MacOS Mojave',
		};

		if (process.platform === 'darwin') {
			const releaseNumber: number = parseInt(os.release().split('.')[0]);
			return names[releaseNumber];
		}

		return os.release();
	};

	return {
		CLIENT_VERSION: `v${pkg.version}`,
		NODE: process.version,
		PLATFORM: {
			OS: process.platform === 'darwin' ? 'MacOS' : process.platform,
			RELEASE: getRelease(),
			RAM: `${Math.floor(os.totalmem() / 1024 / 1024 / 1024)}GB`,
			CPU: `${os.cpus().length} CORES`,
		},
	};
};

/**
 * @name getUserInfo
 */
export const getUserInfo = () => ({
	username: os.userInfo().username,
	shell: os.userInfo().shell,
});

export const randomString = (len = 7) =>
	('' + eval(`1e${len}`)).replace(/[01]/g, () => (0 | (Math.random() * 16)).toString(16));
