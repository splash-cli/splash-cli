import Conf from 'conf'

export type Alias = {
  name: string;
  id: number;
}

type Nullable<T> = T | null

export interface IStorage {
  COUNTER: number;
  LAST_WALLPAPER: Nullable<string>;
  KEYS: {
    APP_ID: string;
    CLIENT_SECRET: string;
    CALLBACK_URL: string;
    REDIRECT_URI: string;
    // When the user is logged in we'll use this.
    ACCESS_TOKEN: Nullable<string>;
  }
}

export interface IPreferences {
  DOWNLOADS_FOLDER: string;
  CONFIRM_WALLPAPER: boolean;
  ALIASES: Alias[]
  AUTO_REPORT: boolean;
  USE_USER_FOLDER: boolean;
  ASK_FOR_COLLECTION: boolean;
  ASK_FOR_LIKE: boolean;
}

export const Settings = new Conf<IStorage>({
  projectName: 'SplashCLI',
  migrations: {},
  accessPropertiesByDotNotation: true,
  configName: 'SETTINGS',
  defaults: {
    COUNTER: 0,
    KEYS: {
      APP_ID: process.env.APP_ID ?? 'app_id',
      CALLBACK_URL: process.env.CALLBACK_URL ?? 'callback_url',
      REDIRECT_URI: 'http://localhost:5835',
      CLIENT_SECRET: process.env.CLIENT_SECRET ?? 'client_secret',
      ACCESS_TOKEN: null
    },
    LAST_WALLPAPER: null
  }
})

export const Preferences = new Conf<IPreferences>({
  projectName: 'SplashCLI',
  migrations: {},
  accessPropertiesByDotNotation: true,
  configName: 'PREFERENCES',
  defaults: {
    USE_USER_FOLDER: false,
    ALIASES: [],
    ASK_FOR_COLLECTION: false,
    ASK_FOR_LIKE: false,
    AUTO_REPORT: true,
    CONFIRM_WALLPAPER: false,
    DOWNLOADS_FOLDER: '~/Pictures/splash_photos',
  }
})
