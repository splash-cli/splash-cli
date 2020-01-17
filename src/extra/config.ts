import { pathFixer } from './utils';

import Conf from 'conf';

export const defaultSettings: SplashCLI.Settings = {
	lastWP: null,
	'confirm-wallpaper': false,
	shouldReportErrors: false,
	shouldReportErrorsAutomatically: true,
	directory: pathFixer('~/Pictures/splash_photos'),
	aliases: [
		{ name: 'editorial', id: 317099 },
		{ name: 'wallpapers', id: 1065976 },
		{ name: 'textures', id: 3330445 },
	],
	userFolder: false,
	counter: 0,
	askForLike: true,
	askForCollection: false,
	picOfTheDay: {
		date: {
			lastUpdate: new Date('18 June 1999').getTime(),
			delay: 1000 * 60 * 30,
		},
	},
};

export const config = new Conf<SplashCLI.Settings>({ defaults: defaultSettings });

export const keys = {
	client_id: process.env.CLIENT_ID as string,
	client_secret: process.env.CLIENT_SECRET as string,
	redirect_uri: 'http://localhost:5835/',
};

if (config.has('user') && config.get('user').token) {
	config.set('keys', {
		applicationId: keys.client_id,
		secret: keys.client_secret,
		callbackUrl: keys.redirect_uri,
		bearerToken: config.get('user').token,
	});
} else {
	config.set('keys', {
		applicationId: keys.client_id,
		secret: keys.client_secret,
		callbackUrl: keys.redirect_uri,
	});
}

export const commandsList = {};
