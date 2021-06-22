import { authenticatedRequest } from '../../extra/utils';
import { ServerResponse } from 'http';

export class CollectionManager {
	/**
	 *
	 * @param {String} id
	 *
	 * @returns {Collection} The collection
	 */
	static get(id) {
		if (!id || (typeof id !== 'string' && typeof id !== 'number')) {
			throw new SyntaxError(`Expected id as String got ${typeof id}`);
		}

		return new Collection(id);
	}

	/**
	 *
	 * @param {String} id Collection ID
	 *
	 * @returns {ServerResponse} The response object.
	 */
	static async delete(id) {
		if (!id || (typeof id !== 'string' && typeof id !== 'number')) {
			throw new SyntaxError(`Expected id as String got ${typeof id}`);
		}

		return await authenticatedRequest(`/collections/${id}`, { method: 'DELETE' });
	}

	/**
	 *
	 * @param {String} title Collection Title
	 * @param {String} description Collection Description
	 * @param {Boolean} isPrivate Is a private collection?
	 *
	 * @returns The created collection
	 */
	static async create(title, description, isPrivate = false) {
		return await authenticatedRequest('/collections', {
			method: 'POST',
			body: JSON.stringify(
				{
					title,
					description,
					private: isPrivate,
				},
				null,
				2,
			),
			headers: {
				'Content-Type': 'application/json',
			},
		});
	}
}

export class Collection {
	constructor(id) {
		this.id = id;
	}

	/**
	 * @returns {Array} An array of photos.
	 */
	async getPhotos() {
		return await authenticatedRequest(`/collections/${this.id}/photos`);
	}

	/**
	 * @returns {Object} Collection.
	 */
	async info() {
		return await authenticatedRequest(`/collections/${this.id}`);
	}

	/**
	 * @returns An array of collections.
	 */
	async getRelated() {
		return await authenticatedRequest(`/collections/${this.id}/related`);
	}

	/**
	 * @returns {ServerResponse} The response object.
	 */
	async delete() {
		return await authenticatedRequest(`/collections/${this.id}`, { method: 'DELETE' });
	}

	/**
	 * @returns The added photo.
	 */
	async addPhoto(photo_id) {
		if (!photo_id || (typeof photo_id !== 'string' && typeof id !== 'number')) {
			throw new SyntaxError(`Expected id as String got ${typeof photo_id}`);
		}

		return await authenticatedRequest(`/collections/${this.id}/add`, {
			method: 'POST',
			body: JSON.stringify({ photo_id }, null, 2),
			json: true,
		});
	}

	/**
	 * @returns The removed photo.
	 */
	async removePhoto(photo_id) {
		if (!photo_id || (typeof photo_id !== 'string' && typeof id !== 'number')) {
			throw new SyntaxError(`Expected id as String got ${typeof photo_id}`);
		}

		return await authenticatedRequest(`/collections/${this.id}/remove`, {
			method: 'DELETE',
			body: JSON.stringify({ photo_id }, null, 2),
		});
	}
}
