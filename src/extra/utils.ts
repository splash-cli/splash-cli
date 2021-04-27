require( 'babel-polyfill' );
require( 'regenerator-runtime' );

const pkg = require( '../../package.json' );
const Sentry = require( '@sentry/node' );

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
import downloadFile from 'simple-download';
import terminalLink from 'terminal-link';
import wallpaper from 'wallpaper';
import normalize from 'normalize-url';
import sharp from 'sharp';

import config from './storage';
import { defaultSettings, keys, Settings } from './config';

import Alias from '../commands/libs/Alias';
import User from '../commands/libs/User';
import { Collection } from '../commands/libs/Collection';
import { isPath, pathFixer } from './util/string';
import { logger, printBlock } from './util/printing';
import { errorHandler } from './util/general';

// TODO END TRANSITION

export {
	authenticate,
	authenticatedRequest,
	generateAuthenticationURL,
	checkUserAuth,
	warnIfNotLogged,
} from './util/auth';

export {
	isPath,
	pathFixer
} from './util/string';

export {
	mapObject,
	tryParse
} from './util/objects';

export {
	logger,
	printBlock
} from './util/printing';

export {
	errorHandler
} from './util/general';


/**
 * @description Restore default settings
 */
export async function clearSettings() {
	const settingsList = Object.keys( defaultSettings );

	for ( let i = 0; i < settingsList.length; i++ ) {
		const setting: any = settingsList[i];

		if ( config.has( setting ) ) {
			config.delete( setting );
			config.set( setting, defaultSettings[setting] );
		}
	}

	return config.get() === defaultSettings;
}

/**
 * @description Parse a collection alias
 * @param {String} alias
 */
export const parseCollection = ( alias: string ): string => {
	const exists = Alias.has( alias );

	if ( exists )
		return Alias.get( alias ).id.toString();

	return alias;
};

export async function reportPrompt( error ) {
	const { shouldReport } = await prompt( {
		name: 'shouldReport',
		message: 'Report the error?',
		type: 'confirm',
		default: true,
		when: () => !config.get( 'shouldReportErrorsAutomatically' ),
	} );

	if ( shouldReport || config.get( 'shouldReportErrorsAutomatically' ) === true ) {
		const event_id = Sentry.captureException( error );
		config.set( 'lastEventId', event_id );
	}
}



export const getCollection = async () => {
	let list = await User.getCollections();
	list = list.map( ( { title, id, curated, updatedAt, description } ) => ( {
		id,
		title,
		curated,
		updatedAt,
		description,
	} ) );

	const searchCollections = ( collections, defaultValue = '' ) => ( answers, input ) => {
		input = input || defaultValue || '';

		return new Promise( async ( resolve ) => {
			collections = collections.map( ( item ) => chalk`{dim [${item.id}]} {yellow ${item.title}}` );
			const fuzzyResult = fuzzy.filter( input, collections );
			resolve( fuzzyResult.map( ( el ) => el.original ) );
		} );
	};

	const { collection_id } = await prompt( [
		{
			name: 'collection_id',
			type: 'autocomplete',
			message: 'Please choose a collection',
			source: ( answers, input ) => searchCollections( list )( answers, input ),
			filter: ( value ) => parseInt( value.match( /\[(\d+)\].*?/i )[1].trim() ),
		},
	] );

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
export async function download( photo, url: string, flags, setAsWP: boolean = true ) {
	let messages = [];
	const rotationAngle = parseInt( flags.rotate ) || 0;

	let dir = config.get( 'directory' );

	if ( config.get( 'userFolder' ) === true ) {
		dir = path.join( config.get( 'directory' ), `@${photo.user.username}` );
	}

	mkdirp.sync( dir );

	const hasEdits = flags.flip || flags.grayscale || !!flags.rotate || !!flags.colorspace;

	const sentences = [
		'Making something awesome',
		'Something is happening...',
		'Magic stuff',
		'Doing something... else',
		'You know, backend stuff...',
		'Preparing your photo...',
		'You\'re awesome!',
		hasEdits && 'Applying your edits...'
	];

	const spinner = new Ora( {
		text: sentences[Math.floor( Math.random() * ( sentences.length - 1 ) )],
		color: 'yellow',
		spinner: isMonth( 'december' ) ? 'christmas' : 'earth',
	} );

	if ( flags.quiet ) {
		console.log = console.info = () => { };
		spinner.start = spinner.fail = () => { };
	}

	spinner.start();

	let filename = path.join( dir, `${photo.id}.jpg` );

	if ( flags.save && isPath( flags.save ) ) {
		const savePath = pathFixer( flags.save );

		filename = path.join( savePath, `${photo.id}.jpg` );

		if ( isImage( flags.save ) ) {
			filename = savePath;
		}
	}

	const fileInfo = await downloadFile( url, filename );

	config.set( 'counter', config.get( 'counter' ) + 1 );

	if ( !flags.quiet ) spinner.succeed();
	if ( setAsWP && !flags.save ) {
		if ( flags.screen || flags.scale ) {
			if ( process.platform !== 'darwin' ) {
				console.log();
				logger.warn(
					chalk`{dim > Sorry, this function ({underline ${flags.screen
						? '"screen"'
						: '"scale"'}}) is available {bold only on MacOS}}`,
				);
				console.log();
			}
		}

		let screen;
		if ( flags.screen ) {
			if ( !/[0-9|main|all]+/g.test( flags.screen ) ) {
				screen = false;
			} else {
				screen = flags.screen;
			}
		}

		let scale;
		if ( flags.scale ) {
			if ( !/[auto|fill|fit|stretch|center]/g.test( flags.scale ) ) {
				scale = false;
			} else {
				scale = flags.scale;
			}
		}

		let image = sharp( filename )
			.grayscale( flags.grayscale )
			.flip( flags.flip );


		if ( flags.rotate ) {
			image.rotate( rotationAngle );
		}

		if ( flags.colorspace ) {
			if ( !/srgb|rgb|cmyk|lab|b\-w/g.test( flags.colorspace ) ) {
				messages.push( `Invalid colorspace: '${flags.colorspace}'.` );
			}

			image = image.toColorspace( flags.colorspace );
		}

		if ( flags.blur ) {
			image = image.blur( flags.blur );
		}

		if ( hasEdits ) {
			filename = filename.replace( /(\.[a-z]+)$/g, '_edited$1' );
			await image.toFile( filename );
		}


		if ( scale ) {
			await wallpaper.set( filename, { scale } );
		} else if ( screen ) {
			await wallpaper.set( filename, { screen } );
		} else if ( scale && screen ) {
			await wallpaper.set( filename, { screen, scale } );
		} else {
			await wallpaper.set( filename );
		}
	} else {
		console.log();
		printBlock( chalk`Picture stored at: {underline ${path.join( fileInfo.dir, fileInfo.base )}}` );
		console.log();
	}

	console.log();

	showCopy( photo, flags.info );

	console.log();

	if ( rotationAngle ) {
		console.log( chalk`Picture rotated by {yellow ${rotationAngle}} degrees.` );
		console.log();
	}

	if ( !config.has( 'user' ) ) {
		logger.info( chalk`{dim Login to like this photo.}` );
		console.log();
	} else if ( photo.liked_by_user ) {
		logger.info( chalk`{dim Photo liked by user.}` );
		console.log();
	}

	if ( messages.length ) {
		console.log();
		messages.forEach( msg => logger.warn( msg ) );
		console.log();
	}

	if ( flags.save ) return;
	if ( !config.has( 'user' ) ) return;

	const promptLike = config.get( 'askForLike' );
	const promptCollection = config.get( 'askForCollection' );
	const confirmWallpaper = config.get( 'confirm-wallpaper' );

	const { liked, confirmed, addToCollection } = await prompt( [
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
	] );

	if ( !confirmed && confirmWallpaper ) {
		const lastWP = config.get( 'lastWP' );
		wallpaper.set( lastWP );
		return;
	}

	const currentWallpaper = await wallpaper.get();
	config.set( 'lastWP', currentWallpaper );

	if ( liked === true && promptLike ) {
		const id = photo._id || photo.id;

		try {
			await User.likePhoto( id );

			console.log();
			console.log( 'Photo liked.' );
		} catch ( error ) {
			errorHandler( error );
		}
	}

	if ( addToCollection === true && promptCollection ) {
		const id = photo._id || photo.id;

		try {
			const collection_id = await getCollection();
			const collection = new Collection( collection_id );

			await collection.addPhoto( id );

			console.log();
			console.log( 'Photo added to the collection.' );
		} catch ( error ) {
			errorHandler( error );
		}
	}
}



/**
 *
 * @name addTimeTo
 * @description Add an amount of milliseconds to a date
 *
 * @param {Date} date
 * @param {Number} time
 */
export const addTimeTo = ( date, time ) => new Date( date.getTime() + time );

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
export const confirmWithExtra = ( name, message, extra, options ) => {
	return {
		name,
		message,
		default: `${options.default === 0 ? 'Y' : 'y'}/${options.default === 1 ? 'n' : 'N'}/${options.default === 2 ? extra.toUpperCase() : extra
			}`,
		when: options.when,
		validate: ( input ) => new RegExp( `(^y$|^yes$)|(^n$|^no$|^nope$)|(^${extra}$)`, 'gi' ).test( input ),
		filter: ( input ) => input.toLowerCase(),
	};
};

/**
 * @name getSystemInfos
 */
export const getSystemInfos = () => {
	const getRelease = () => {
		if ( process.platform === 'darwin' ) {
			return {
				12: 'MacOS Mountain Lion',
				13: 'MacOS Mavericks',
				14: 'MacOS Yosemite',
				15: 'MacOS El Capitan',
				16: 'MacOS Sierra',
				17: 'MacOS High Sierra',
				19: 'MacOS Catalina',
				18: 'MacOS Mojave',
			}[os.release().split( '.' )[0]];
		}

		return os.release();
	};

	return {
		CLIENT_VERSION: `v${pkg.version}`,
		NODE: process.version,
		PLATFORM: {
			OS: process.platform === 'darwin' ? 'MacOS' : process.platform,
			RELEASE: getRelease(),
			RAM: `${Math.floor( os.totalmem() / 1024 / 1024 / 1024 )}GB`,
			CPU: `${os.cpus().length} CORES`,
		},
	};
};

/**
 * @name getUserInfo
 */
export const getUserInfo = () => ( {
	username: os.userInfo().username,
	shell: os.userInfo().shell,
} );

export const randomString = ( len = 7 ) =>
	( '' + eval( `1e${len}` ) ).replace( /[01]/g, () => ( 0 | ( Math.random() * 16 ) ).toString( 16 ) );
