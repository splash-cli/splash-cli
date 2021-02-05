import { pathFixer } from './utils';

export type Key = 'client_id' | 'client_secret' | 'redirect_uri'
export type Settings = {
	lastError?: Error;
	userEmail?: string;
	lastWP?: string;
	'confirm-wallpaper': boolean;
	shouldReportErrors: boolean;
	shouldReportErrorsAutomatically: boolean;
	directory: string;
	aliases: { name: string, id: number }[]
	userFolder: boolean;
	counter: number;
	askForLike: boolean;
	askForCollection: boolean;
	user?: any;
	picOftheDay: {
		date: {
			lastUpdate: number;
			delay: number;
		}
	}
}

export const defaultSettings: Settings = {
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
	picOftheDay: {
		date: {
			lastUpdate: new Date().getTime(),
			delay: 1000 * 60 * 30
		}
	}
};

export const keys: Record<Key, string> = {
	client_id: process.env.CLIENT_ID,
	client_secret: process.env.CLIENT_SECRET,
	redirect_uri: 'http://localhost:5835/',
};
