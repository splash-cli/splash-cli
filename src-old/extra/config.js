import { pathFixer } from './utils';

export const defaultSettings = {
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

export const keys = {
	client_id: process.env.CLIENT_ID,
	client_secret: process.env.CLIENT_SECRET,
	redirect_uri: 'http://localhost:5835/',
};
