declare interface UnsplashPhoto {
	errors?: string[];
	id: string;
	created_at: Date;
	updated_at: Date;
	width: number;
	height: number;
	color: string;
	downloads: number;
	likes: number;
	liked_by_user: boolean;
	description: string;
	exif: Exif;
	location: Location;
	current_user_collections: CurrentUserCollection[];
	urls: Urls;
	links: UnsplashPhotoLinks;
	user: UnsplashUser;
}

declare interface CurrentUserCollection {
	id: number;
	title: string;
	published_at: Date;
	updated_at: Date;
	curated: boolean;
	cover_photo: null;
	user: null;
}

declare interface Exif {
	make: string;
	model: string;
	exposure_time: string;
	aperture: string;
	focal_length: string;
	iso: number;
}

declare interface UnsplashPhotoLinks {
	self: string;
	html: string;
	download: string;
	download_location: string;
}

declare interface Location {
	city: string;
	country: string;
	position: Position;
}

declare interface Position {
	latitude: number;
	longitude: number;
}

declare interface Urls {
	raw: string;
	full: string;
	regular: string;
	small: string;
	thumb: string;
}

declare interface UnsplashUser {
	id: string;
	updated_at: Date;
	username: string;
	name: string;
	portfolio_url: string;
	bio: string;
	location: string;
	total_likes: number;
	total_photos: number;
	total_collections: number;
	links: UserLinks;
}

declare interface UserLinks {
	self: string;
	html: string;
	photos: string;
	likes: string;
	portfolio: string;
}

declare interface RemoteCollection {
	id: number;
	title: string;
	description: string;
	publishedAt: Date;
	updatedAt: Date;
	curated: boolean;
	featured: boolean;
	totalPhotos: number;
	private: boolean;
	shareKey: string;
	coverPhoto: null;
	user: null;
	links: RemoteCollectionLinks;
}

declare interface RemoteCollectionLinks {
	self: string;
	html: string;
	photos: string;
}

declare namespace SplashCLI {
	type Commands = 'settings' | 'alias' | 'collection' | 'dir' | 'user' | 'help';

	namespace SubCommands {
		type Settings = 'get' | 'set' | 'restore' | 'help';
		type Alias = 'get' | 'set' | 'remove' | 'help';
		type Collection = 'get' | 'delete' | 'help';
		type Dir = 'clean' | 'get' | 'count' | 'help';
		type User = 'login' | 'logout' | 'get' | 'liked' | 'collections' | 'edit' | 'help';
	}

	interface Flags {
		help?: boolean;
		version?: boolean;
		set?: string;
		collection?: string;
		day?: boolean;
		featured?: boolean;
		quiet?: boolean;
		user?: string;
		settings?: boolean;
		id?: string;
		query?: string;
		orientation?: string;
		save?: string;
		info?: boolean;
		scale?: string;
		screen?: string;
	}

	export interface Settings {
		lastWP?: string | null;
		'confirm-wallpaper'?: boolean;
		shouldReportErrors?: boolean;
		shouldReportErrorsAutomatically?: boolean;
		directory?: string;
		aliases?: {
			name?: string;
			id?: number | string;
		}[];
		userFolder?: boolean;
		counter?: number;
		askForLike?: boolean;
		askForCollection?: boolean;
		client_id?: string;
		client_secret?: string;
		keys?: {
			applicationId?: string;
			secret?: string;
			callbackUrl?: string;
			bearerToken?: string;
		};
		picOfTheDay?: {
			date?: {
				lastUpdate?: number;
				delay?: number;
			};
		};
		lastError?: null;
		lastEventId?: null;
		user?: {
			profile?: any;
			token?: string;
			refresh?: string;
		};
	}
}
