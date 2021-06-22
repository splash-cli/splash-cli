import { URL } from 'url';

import got from 'got';
import parseID from '@splash-cli/parse-unsplash-id';

import { parseCollection, authenticatedRequest, tryParse, errorHandler } from './utils';
import config from './storage';
import { keys } from './config';

export default class Unsplash {
	endpoint = new URL('https://api.unsplash.com');
	isLogged = config.has('user');

	constructor(client_id) {
		this.endpoint.searchParams.set('client_id', client_id);
	}

	static shared = new Unsplash(keys.client_id);

	async getCollection(id) {
		const endpoint = this.endpoint;

		// Setup the route
		endpoint.pathname = `/collections/${id}`;

		try {
			if (this.isLogged) {
				return authenticatedRequest(this.endpoint.pathname);
			}

			const response = await got(this.endpoint.href);
			if (response.statusCode !== 200) return errorHandler(new Error(response.statusMessage));
			return tryParse(response.body);
		} catch (error) {
			errorHandler(error);
		}
	}

	async getUser(id) {
		const endpoint = this.endpoint;

		// Setup the route
		endpoint.pathname = `/users/${id}`;

		try {
			if (this.isLogged) {
				return authenticatedRequest(this.endpoint.pathname);
			}

			const response = await got(this.endpoint.href);
			if (response.statusCode !== 200) return errorHandler(new Error(response.statusMessage));
			return tryParse(response.body);
		} catch (error) {
			errorHandler(error);
		}
	}

	async getRandomPhoto({
		collection = false,
		query = false,
		username = false,
		featured = false,
		count = 1,
		orientation = 'landscape',
	} = {}) {
		const endpoint = this.endpoint;

		// Setup the route
		endpoint.pathname = '/photos/random';

		// Safe verification
		if (typeof count === 'number') {
			// Get only 1 photo
			endpoint.searchParams.set('count', count);
		}

		// Parse collection aliases
		if (collection) {
			if (collection.includes(',')) {
				collection = collection
					.split(',')
					.map(parseCollection)
					.join(',');

				endpoint.searchParams.set('collections', collection);
			} else {
				endpoint.searchParams.set('collections', collection);
			}
		}

		// Encode query
		if (query) {
			endpoint.searchParams.set('query', query);
		}

		// Encode username
		if (username) {
			endpoint.searchParams.set('username', username);
		}

		if (orientation) {
			endpoint.searchParams.set('orientation', orientation);
		}

		// Limit to featured photos
		if (typeof featured === 'boolean') {
			endpoint.searchParams.set('featured', featured);
		}

		try {
			if (this.isLogged) {
				return authenticatedRequest(this.endpoint.pathname);
			}

			const response = await got(this.endpoint.href);

			if (response.statusCode !== 200) return errorHandler(new Error(response.statusMessage));

			return tryParse(response.body);
		} catch (error) {
			errorHandler(error);
		}
	}

	async getPhoto(id) {
		const endpoint = this.endpoint;

		endpoint.pathname = `/photos/${parseID(id)}`;

		try {
			if (this.isLogged) {
				return authenticatedRequest(this.endpoint.pathname);
			}

			const response = await got(this.endpoint.href);

			if (response.statusCode !== 200) return errorHandler(new Error(response.statusMessage));

			return tryParse(response.body);
		} catch (error) {
			errorHandler(error);
		}
	}

	async getDownloadLink(id) {
		const endpoint = this.endpoint;

		endpoint.pathname = `/photos/${parseID(id)}/download`;

		try {
			if (this.isLogged) {
				return authenticatedRequest(this.endpoint.pathname);
			}

			const response = await got(this.endpoint.href);

			if (response.statusCode !== 200) return errorHandler(new Error(response.statusMessage));

			return tryParse(response.body);
		} catch (error) {
			errorHandler(error);
		}
	}

	async picOfTheDay() {
		try {
			const { body: photo } = await got('https://lambda.splash-cli.app/api', {
				json: true,
			});

			return await this.getPhoto(photo.id);
		} catch (error) {
			errorHandler(error);
		}
	}
}
