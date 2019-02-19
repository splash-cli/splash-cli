interface UnsplashPhoto {
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

interface CurrentUserCollection {
	id: number;
	title: string;
	published_at: Date;
	updated_at: Date;
	curated: boolean;
	cover_photo: null;
	user: null;
}

interface Exif {
	make: string;
	model: string;
	exposure_time: string;
	aperture: string;
	focal_length: string;
	iso: number;
}

interface UnsplashPhotoLinks {
	self: string;
	html: string;
	download: string;
	download_location: string;
}

interface Location {
	city: string;
	country: string;
	position: Position;
}

interface Position {
	latitude: number;
	longitude: number;
}

interface Urls {
	raw: string;
	full: string;
	regular: string;
	small: string;
	thumb: string;
}

interface UnsplashUser {
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

interface UserLinks {
	self: string;
	html: string;
	photos: string;
	likes: string;
	portfolio: string;
}

export interface RemoteCollection {
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

export interface RemoteCollectionLinks {
	self: string;
	html: string;
	photos: string;
}
