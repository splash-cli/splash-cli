interface SettingsUser {
	profile: Profile;
	token?: string;
	refresh?: string;
}

interface Profile {
	id: string;
	updated_at: Date;
	username: string;
	name: string;
	first_name: string;
	last_name: string;
	twitter_username: string;
	portfolio_url: string;
	bio: string;
	location: string;
	links: Links;
	profile_image: ProfileImage;
	instagram_username: string;
	total_collections: number;
	total_likes: number;
	total_photos: number;
	accepted_tos: boolean;
	followed_by_user: boolean;
	photos: Photo[];
	badge: null;
	downloads: number;
	tags: Tags;
	followers_count: number;
	following_count: number;
	allow_messages: boolean;
	numeric_id: number;
	uid: string;
	uploads_remaining: number;
	unlimited_uploads: boolean;
	email: string;
	url:string;
}

interface Links {
	self: string;
	html: string;
	photos: string;
	likes: string;
	portfolio: string;
	following: string;
	followers: string;
}

interface Photo {
	id: string;
	urls: Urls;
}

interface Urls {
	raw: string;
	full: string;
	regular: string;
	small: string;
	thumb: string;
}

interface ProfileImage {
	small: string;
	medium: string;
	large: string;
}

interface Tags {
	custom: Aggregated[];
	aggregated: Aggregated[];
}

interface Aggregated {
	title: string;
}
