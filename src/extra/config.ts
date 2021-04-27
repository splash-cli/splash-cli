import { pathFixer } from './utils';

export type Key = 'client_id' | 'client_secret' | 'redirect_uri'

export enum SettingsKey {
	LAST_ERROR = 'lastError',
	USER_EMAIL = 'userEmail',
	LAST_WALLPAPER = 'lastWp',
	CONFIRM_WALLPAPER = 'confimWp',
	REPORT_ERRORS = 'shouldReportErrors',
	AUTO_REPORT = 'shouldReportErrorsAutomatically',
	DIRECTORY = 'directory',
	ALIASES = 'aliases',
	USER_FOLDER = 'userFolder',
	LAST_EVENT_ID = 'lastEventId',
	COUNTER = 'counter',
	ASK_FOR_LIKE = 'askForLike',
	ASK_FOR_COLLECTION = 'askForCollection',
	KEYS = 'keys',
	USER = 'user',
	PIC_OF_THE_DAY = 'picOfTheDay'
}

export type Settings = {
	[SettingsKey.LAST_ERROR]?: Error;
	[SettingsKey.USER_EMAIL]?: string;
	[SettingsKey.LAST_WALLPAPER]?: string;
	[SettingsKey.CONFIRM_WALLPAPER]: boolean;
	[SettingsKey.REPORT_ERRORS]: boolean;
	[SettingsKey.AUTO_REPORT]: boolean;
	[SettingsKey.DIRECTORY]: string;
	[SettingsKey.ALIASES]: { name: string, id: number }[];
	[SettingsKey.USER_FOLDER]: boolean;
	[SettingsKey.LAST_EVENT_ID]?: string;
	[SettingsKey.COUNTER]: number;
	[SettingsKey.ASK_FOR_LIKE]: boolean;
	[SettingsKey.ASK_FOR_COLLECTION]: boolean;
	[SettingsKey.KEYS]: {
		applicationId: string;
		secret: string;
		callbackUrl: string;
		bearerToken?: string;
	};
	[SettingsKey.USER]?: {
		token: string;
		profile: any
	};
	[SettingsKey.PIC_OF_THE_DAY]: {
		date: {
			lastUpdate: number;
			delay: number;
		}
	}
}

export const keys: Record<Key, string> = {
	client_id: process.env.CLIENT_ID,
	client_secret: process.env.CLIENT_SECRET,
	redirect_uri: 'http://localhost:5835/',
};


export const defaultSettings: Settings = {
	[SettingsKey.LAST_WALLPAPER]: null,
	[SettingsKey.CONFIRM_WALLPAPER]: false,
	[SettingsKey.KEYS]: {
		applicationId: keys.client_id,
		secret: keys.client_secret,
		callbackUrl: keys.redirect_uri
	},
	[SettingsKey.REPORT_ERRORS]: false,
	[SettingsKey.AUTO_REPORT]: true,
	[SettingsKey.DIRECTORY]: pathFixer( '~/Pictures/splash_photos' ),
	[SettingsKey.ALIASES]: [
		{ name: 'editorial', id: 317099 },
		{ name: 'wallpapers', id: 1065976 },
		{ name: 'textures', id: 3330445 },
	],
	[SettingsKey.USER_FOLDER]: false,
	[SettingsKey.COUNTER]: 0,
	[SettingsKey.ASK_FOR_LIKE]: true,
	[SettingsKey.ASK_FOR_COLLECTION]: false,
	[SettingsKey.PIC_OF_THE_DAY]: {
		date: {
			lastUpdate: new Date().getTime(),
			delay: 1000 * 60 * 30
		}
	}
};
