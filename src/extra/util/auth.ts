require( 'babel-polyfill' );
require( 'regenerator-runtime' );

import { errorHandler, printBlock } from '@extra/utils';
import chalk from 'chalk';
import got from 'got';
import normalize from 'normalize-url';
import { URL } from 'url';
import { keys } from '../config';
import config from '../storage';
import { AuthenticationParams, AuthenticationScope } from './AuthTypes';
import { tryParse } from './objects';





/**
 * @description Generate auth URL
 * @param  {...String} scopes
 */
export const generateAuthenticationURL = ( ...scopes: AuthenticationScope[] ) => {
	const url = new URL( 'https://unsplash.com/oauth/authorize' );


	url.searchParams.set( 'client_id', keys.client_id );
	url.searchParams.set( 'redirect_uri', keys.redirect_uri );
	url.searchParams.set( 'response_type', 'code' );

	// TODO: Test
	// url.searchParams.set('scope', scopes.join('+'))

	return url.href + '&scope=' + scopes.join( '+' );
}


/**
 * @description Authenticate the user.
 * @param {Object} params
 */
export const authenticate = async ( { client_id, client_secret, code, redirect_uri }: AuthenticationParams ) => {
	const url = new URL( 'https://unsplash.com' );
	url.pathname = '/oauth/token';

	const payload = {
		client_id: client_id,
		client_secret: client_secret,
		redirect_uri,
		grant_type: 'authorization_code',
		code: code,
	};

	return await got( normalize( url.href ), {
		method: 'POST',
		body: JSON.stringify( payload, null, 2 ),
		headers: {
			'Content-Type': 'application/json',
		},
	} );
}

export const getAuthenticationHeaders = () => ( {
	Auhtorization: `Bearer ${config.get( 'user' ).token}`
} )

/**
 * @description Make an authenticated request (with bearer)
 * @param {String} endpoint
 * @param {Object} options
 */

type RequestOptions = {
	headers?: Record<string, string>
	json?: boolean;
	method?: 'POST' | 'GET' | 'PUT' | 'PATCH' | 'DELETE';
}

export const authenticatedRequest = async (
	endpoint: string,
	options: RequestOptions = { method: 'GET' }
) => {
	warnIfNotLogged();

	if ( options.json ) {
		options.headers = {
			...options.headers,
			'Content-Type': 'application/json',
		};

		delete options.json;
	}

	const { token } = config.get( 'user' );
	const httpOptions = {
		...options,
		headers: {
			...options.headers,
			Authorization: `Bearer ${token}`,
		},
	};

	const response = await got( normalize( `https://api.unsplash.com/${endpoint}` ), httpOptions );

	switch ( response.statusCode ) {
		case 200:
		case 201:
		case 203:
		case 404:
		case 500:
		case 302:
		case 422:
			return tryParse( response.body );
		default:
			return response;
	}
}

/**
 * Warn the user if is not logged.
 */
export const warnIfNotLogged = (): boolean => {
	if ( !config.has( 'user' ) || !config.get( 'user' ).token ) {
		printBlock( chalk`Please log in.` );

		return false
	}

	return true;
}



/**
 * Check if everything works fine with the user settings.
 */
export function checkUserAuth() {
	const { token, profile: user } = config.get( 'user' );

	if ( !token ) return false;

	if ( !user ) {
		authenticatedRequest( 'me' )
			.then( ( { body } ) => JSON.parse( body ) )
			.then( ( usr ) => config.set( 'user', Object.assign( { profile: usr }, config.get( 'user' ) ) ) )
			.catch( errorHandler );
	}

	return true;
}
