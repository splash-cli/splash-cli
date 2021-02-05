export type AuthenticationScope = 'public'
	| 'read_user'
	| 'write_user'
	| 'read_photos'
	| 'write_photos'
	| 'write_likes'
	| 'write_followers'
	| 'read_collections'
	| 'write_collections';


export type AuthenticationParams = {
	client_id: string;
	client_secret: string;
	code: string;
	redirect_uri: string;
}
