const opn = require('opn');
const Ora = require('ora');
const Conf = require('conf');
const clear = require('clear');
const {URL} = require('url');

const os = require('os');

const config = new Conf();
const chalk = require('chalk');
const got = require('got');
const normalize = require('normalize-url');

const spinner = new Ora({text: 'Connecting to Unsplash', color: 'yellow', spinner: 'earth'});

const api = {
	base: 'https://api.unsplash.com',
	token: 'daf9025ad4da801e4ef66ab9d7ea7291a0091b16d69f94972d284c71d7188b34',
	oauth: normalize('https://unsplash.com/oauth/authorize?client_id=daf9025ad4da801e4ef66ab9d7ea7291a0091b16d69f94972d284c71d7188b34&redirect_uri=urn:ietf:wg:oauth:2.0:oob&response_type=code&scope=public')
};

const printBlock = (...lines) => {
	clear();
	console.log();
	if (lines.length > 1) {
		lines.forEach(line => console.log(line));
	} else {
		console.log(lines[0]);
	}
	console.log();
};

const checkArchivments = () => {
	let unlocked = false;
	const list = config.get('archivments');
	const counter = config.get('counter');

	if (list) {
		list.forEach(archivment => {
			if (counter === archivment.downloads) {
				unlocked = archivment;
			}
		});
	}

	return unlocked;
};

const uFormatter = num => {
	if (num > 999999999) {
		if (num % 1000000000 === 0) {
			return (num / 1000000000) + 'B';
		}
		return (num / 1000000000).toFixed(1) + 'B';
	}

	if (num > 999999) {
		if (num % 1000000 === 0) {
			return (num / 1000000) + 'M';
		}
		return (num / 1000000).toFixed(1) + 'M';
	}

	if (num > 999) {
		if (num % 1000 === 0) {
			return (num / 1000) + 'K';
		}
		return (num / 1000).toFixed(1) + 'K';
	}

	return num;
};

const showCopy = data => {
	const user = data.user;
	console.log();

	if (data.description) {
		console.log();
		console.log(chalk.dim(`> ${data.description}`));
		console.log();
	}

	console.log(`Downloaded: ${uFormatter(data.downloads)} times.`);
	console.log(`Viewed: ${uFormatter(data.views)} times.`);
	console.log(`Liked by ${uFormatter(data.likes)} users.`);

	console.log();

	console.log(`Shot by: ${chalk.cyan.bold(user.name)} (@${chalk.yellow(user.username)})`);
	console.log();
};

const parseExif = source => {
	if (source.exif) {
		const exif = [];

		Object.keys(source.exif).forEach(item => {
			const current = {};
			current.name = item;
			if (source.exif[item] === undefined || source.exif[item] === '') {
				current.value = '--';
			} else {
				current.value = source.exif[item];
			}

			exif.push(current);
		});

		return exif;
	}

	return false;
};

const openURL = (flags, url) => {
	spinner.text = '';

	if (!flags.quiet) {
		spinner.start();
	}

	return new Promise((resolve, reject) => {
		const op = opn(url);

		if (op) {
			spinner.succeed();
			resolve(url);
		} else {
			spinner.fail();
			reject(url);
		}
	});
};

const splashError = (e, opt = {message: 'Splash Error', colors: {message: 'yellow', error: 'red'}}) => {
	console.log();
	console.log(chalk`{${opt.colors.message} ${opt.message}:} {${opt.colors.error} ${e}}`);

	throw new Error(e);
};

const capitalize = (string, separator = ' ') => {
	let words = string.split(separator);
	words = words.map(word => {
		return word.charAt(0).toUpperCase() + word.substr(1, word.length);
	});

	return words.join(separator);
};

const pathParser = path => {
	if (path.includes('~')) {
		path = path.replace('~', os.homedir());
	}

	return path;
};

// Parse url / id;
const parseID = id => {
	const regex = /[a-zA-Z0-9_-]{11}/g;

	id = id.toString();

	if (regex.test(id)) {
		return id.match(regex)[0];
	}

	return false;
};

const parseCollection = alias => {
	const aliases = config.get('aliases');

	const collection = aliases.filter(item => {
		return item.name === alias;
	}).shift();

	if (collection) {
		return collection;
	}

	return false;
};

const collectionInfo = async id => {
	try {
		let {body} = await got(`${api.base}/collections/${id}?client_id=${api.token}`);
		body = JSON.parse(body);

		return {
			id: body.id,
			title: body.title,
			description: body.description,
			user: body.user.username,
			featured: body.featured,
			curated: body.curated
		};
	} catch (error) {
		throw new Error(error);
	}
};

const parseCollectionURL = url => {
	let collectionArguments = [];
	let collection = {};
	let COLLECTION_REGEX;

	const isCurated = /\/curated\//g.test(url);

	if (isCurated) {
		COLLECTION_REGEX = /[a-zA-z\-]+\/[0-9]+/;
	} else {
		COLLECTION_REGEX = /[0-9]+\/[a-zA-z\-]+/;
	}

	if (COLLECTION_REGEX.test(url)) {
		collectionArguments = url.match(COLLECTION_REGEX)[0].split('/');

		if (isCurated) {
			collection.name = collectionArguments[0];
			collection.id = collectionArguments[1];
		} else {
			collection.name = collectionArguments[1];
			collection.id = collectionArguments[0];
		}

		return collection;
	}
	return false;
};

// Thanks to @wOxxOm on codereview.stackexchange.com - https://codereview.stackexchange.com/questions/180006/how-can-i-make-my-function-easier-to-read-understand?noredirect=1#comment341954_180006
const downloadFlags = async (url, {id, orientation, query, collection, featured} = {}) => {
	const ORIENTATIONS = {
		landscape: 'landscape',
		horizontal: 'landscape',
		portrait: 'portrait',
		vertical: 'portrait',
		squarish: 'squarish',
		square: 'squarish'
	};

	if (id) {
		id = parseID(id);
		if (!id) {
			printBlock(chalk`{red {bold Invalid}} {yellow url/id}`);
		}

		return `${api.base}/photos/${id}?client_id=${api.token}`;
	}

	const parsedURL = new URL(url);

	if (orientation) {
		orientation = ORIENTATIONS[orientation] || config.get('orientation') || undefined;
		parsedURL.searchParams.set('orientation', orientation);
	}

	const finalizeUrlWith = (name, value) => {
		parsedURL.searchParams.set(name, value);
		return parsedURL.href;
	};

	if (query) {
		finalizeUrlWith('query', query.toLowerCase());
	}

	if (featured) {
		finalizeUrlWith('featured', true);
	}

	if (collection) {
		const {
			value = /[0-9]{3,7}|$/.exec(collection)[0]
		} = parseCollection(collection) || {};

		if (!value) {
			printBlock(chalk`{red Invalid collection ID}`);
			process.exit();
		}

		const info = await collectionInfo(value);

		let message = chalk`Collection: {cyan ${info.title}} by {yellow @${info.user}}`;

		if (info.featured || info.curated) {
			message = `[${[
				info.curated ? 'Curated - ' : '',
				info.featured ? 'Featured' : ''
			].join('')}] ${message}`;
		}

		printBlock(message);

		return finalizeUrlWith('collections', info.id);
	}

	return parsedURL.href;
};

module.exports.checkArchivments = checkArchivments;
module.exports.showCopy = showCopy;
module.exports.parseExif = parseExif;
module.exports.openURL = openURL;
module.exports.splashError = splashError;
module.exports.capitalize = capitalize;
module.exports.pathParser = pathParser;
module.exports.parseID = parseID;
module.exports.parseCollection = parseCollection;
module.exports.collectionInfo = collectionInfo;
module.exports.formatter = uFormatter;
module.exports.downloadFlags = downloadFlags;
module.exports.printBlock = printBlock;
module.exports.parseCollectionURL = parseCollectionURL;
