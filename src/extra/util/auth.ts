require('babel-polyfill');
require('regenerator-runtime');

const pkg = require('../../package.json');
const Sentry = require('@sentry/node');

import path from 'path';
import os from 'os';
import { URL } from 'url';

import fuzzy from 'fuzzy';
import { prompt } from 'inquirer';
import isMonth from '@splash-cli/is-month';
import showCopy from '@splash-cli/show-copy';
import chalk from 'chalk';
import figures from 'figures';
import got from 'got';
import isImage from 'is-image';
import mkdirp from 'mkdirp';
import Ora from 'ora';
import downloadFile from 'simple-download';
import terminalLink from 'terminal-link';
import wallpaper from 'wallpaper';
import normalize from 'normalize-url';
import sharp from 'sharp';

import config from '../storage';
import { defaultSettings, keys } from '../config';

import Alias from '../../commands/libs/Alias';
import User from '../../commands/libs/User';
import { Collection } from '../../commands/libs/Collection';

import { AuthenticationParams, AuthenticationScope } from './AuthTypes'
import { tryParse, mapObject } from './objects';

/**
 * @description Generate auth URL
 * @param  {...String} scopes
 */
export const generateAuthenticationURL = (...scopes: AuthenticationScope[]) => {
	const url = new URL('https://unsplash.com/oauth/authorize');

	// return mapObject(new URL('https://unsplash.com/oauth/authorize'), u => {
	// 	u.searchParams.set('client_id', keys.client_id);
	// 	u.searchParams.set('redirect_uri', keys.redirect_uri);
	// 	u.searchParams.set('response_type', 'code');
	// 	url.searchParams.set('scope', scopes.join('+'))

	// 	return u.href
	// })

	url.searchParams.set('client_id', keys.client_id);
	url.searchParams.set('redirect_uri', keys.redirect_uri);
	url.searchParams.set('response_type', 'code');

	// TODO: Test
	// url.searchParams.set('scope', scopes.join('+'))

	return url.href + '&scope=' + scopes.join('+');
}


/**
 * @description Authenticate the user.
 * @param {Object} params
 */
export const authenticate = async ({ client_id, client_secret, code, redirect_uri }: AuthenticationParams) => {
	const url = new URL('https://unsplash.com');
	url.pathname = '/oauth/token';

	const payload = {
		client_id: client_id,
		client_secret: client_secret,
		redirect_uri,
		grant_type: 'authorization_code',
		code: code,
	};

	return await got(normalize(url.href), {
		method: 'POST',
		body: JSON.stringify(payload, null, 2),
		headers: {
			'Content-Type': 'application/json',
		},
	});
}

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

	if (options.json) {
		options.headers = {
			...options.headers,
			'Content-Type': 'application/json',
		};

		delete options.json;
	}

	const { token } = config.get('user');
	const httpOptions = {
		...options,
		headers: {
			...options.headers,
			Authorization: `Bearer ${token}`,
		},
	};

	const response = await got(normalize(`https://api.unsplash.com/${endpoint}`), httpOptions);

	switch (response.statusCode) {
	case 200:
	case 201:
	case 203:
	case 404:
	case 500:
	case 302:
	case 422:
		return tryParse(response.body);
	default:
		return response;
	}
}

/**
 * Warn the user if is not logged.
 */
export const warnIfNotLogged = (): boolean => {
	if (!config.has('user') || !config.get('user').token) {
		return printBlock(chalk`Please log in.`);
	}

	return true;
}



/**
 * Check if everything works fine with the user settings.
 */
export function checkUserAuth() {
	const { token, profile: user } = config.get('user');

	if (!token) return false;

	if (!user) {
		authenticatedRequest('me')
			.then(({ body }) => JSON.parse(body))
			.then((usr) => config.set('user', Object.assign({ profile: usr }, config.get('user'))))
			.catch(errorHandler);
	}

	return true;
}
