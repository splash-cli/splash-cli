import fs from 'fs';
import path from 'path';
import http from 'http';

import Ora from 'ora';
import terminalLink from 'terminal-link';
import chalk from 'chalk';

import { prompt } from 'inquirer';
import got from 'got';

import config from '../../extra/storage'
import { keys } from '../../extra/config';

import {
	authenticatedRequest,
	errorHandler,
	authenticate,
	tryParse,
	printBlock,
	generateAuthenticationURL,
} from '../../extra/utils';

export default class User {
	static user = config.get('user') || {};

	static auth = {
		test: async ({ access_token, refresh_token } = {}) => {
			try {
				const user = config.get('user');

				const { body } = await got('https://api.unsplash.com/me', {
					headers: {
						Authorization: `Bearer ${user.token}`,
					},
				});

				const profile = JSON.parse(body);

				printBlock(chalk`{bold Welcome {cyan @${profile.username}}!}`);

				await User.auth.logout(true);

				config.set('user', {
					profile,
					token: user.token,
					refresh: user.token,
				});

				process.exit();
			} catch (error) {
				errorHandler(error);
			}
		},
		login: async () => {
			const spinner = new Ora('Waiting...');
			const authURL = generateAuthenticationURL(
				'public',
				'read_user',
				'write_user',
				'read_photos',
				'write_photos',
				'write_likes',
				'write_followers',
				'read_collections',
				'write_collections',
			);

			http
				.createServer(async (req, res) => {
					const render = (filename) => {
						try {
							const html = fs.readFileSync(path.join(__dirname, '..', '..', 'pages', filename + '.html'));
							res.writeHead(200, { 'Content-Type': 'text/html' });
							res.write(html);
							res.end();
						} catch (error) {
							errorHandler(error);
						}
					};

					const send = (data) => {
						try {
							res.writeHead(200, {
								'Content-Type': 'text/html',
							});
							res.write(data);
							res.end();
						} catch (error) {
							errorHandler(error);
						}
					};

					const redirect = (to) => {
						res.writeHead(302, {
							Location: to,
						});
						res.end();
					};

					if (req.url == '/login') return redirect(authURL);

					if (req.url.includes('code')) {
						if (req.url.match(/code=(.*)/)[1]) {
							if (spinner) spinner.text = 'Authenticating...';

							try {
								spinner.stop();
								const authorizationCode = req.url.match(/code=(.*)/)[1];

								let { body: data } = await authenticate({
									client_id: keys.client_id,
									client_secret: keys.client_secret,
									code: authorizationCode,
									redirect_uri: 'http://localhost:5835',
								});

								if (typeof data == 'string') {
									data = tryParse(data);
								}

								if (data.error) {
									spinner.fail(data.error);

									send(data.error_description);
									errorHandler(new Error(data.error_description));

									setTimeout(() => {
										process.exit(0);
									}, 500);

									return;
								}

								config.set('user', {
									token: data.access_token,
									refresh: data.refresh_token,
									profile: {},
								});

								send('You can now close this tab.');

								spinner.stop();

								return User.auth.test(data);
							} catch (error) {
								send('An error is occurred. Please check you terminal app.');
								spinner.fail('Failed.');
								errorHandler(error);

								setTimeout(() => {
									process.exit(0);
								}, 500);

								return;
							}
						}
					}

					return render('index');
				})
				.listen(5835, () => {
					printBlock(
						chalk`{yellow {bold Splash CLI:} Please click on the link below to login}`,
						chalk`{cyan {dim ${terminalLink('Click Here', authURL)}}}`,
					);

					spinner.start();
				});
		},
		logout: async (force = false) => {
			if (force) {
				config.delete('user');
				return true;
			}

			const { isSure } = await prompt([
				{
					name: 'isSure',
					message: 'Are you sure?',
					default: false,
					type: 'confirm',
				},
			]);

			if (isSure !== true) {
				console.log(chalk`{bold {red Aborted}}`);
				return false;
			}

			config.delete('user');
			return true;
		},
	};

	static async get() {
		let user;

		try {
			const data = await authenticatedRequest('me');
			config.set('user', Object.assign({}, config.get('user'), { profile: data }));
			user = this.parseUser(data);
		} catch (error) {
			user = this.parseUser(config.get('user').profile);
		}

		return user;
	}

	static parseUser(user) {
		return chalk`
			{yellow Name}: ${user.name} {dim (@${user.username})}
			{yellow Bio}: ${user.bio
		.trim()
		.split('\n')
		.map((item) => item.replace(/^\s|\s$/g, ''))
		.join('\n')}
			{yellow Location}: ${user.location}

			{dim —————————————————————————————————————————}

			{yellow Downloads Count}: ${user.downloads}
			{yellow Photos Count}: ${user.photos.length}

			{dim —————————————————————————————————————————}

			{yellow Followers}: ${user.followers_count}
			{yellow Following}: ${user.following_count}
		`
			.split('\n')
			.map((item) => '  ' + item.trim())
			.join('\n');
	}

	static async update(payload) {
		return await authenticatedRequest('me', {
			method: 'PUT',
			body: JSON.stringify(payload, null, 2),
			headers: {
				'Content-Type': 'application/json',
			},
		});
	}

	static async getLikes() {
		const {
			profile: { username, total_likes: totalLikes },
		} = config.get('user');
		const likedPhotos = [];

		const photos = await authenticatedRequest(`users/${username}/likes`);

		photos.map((photo) => {
			likedPhotos.push({
				id: photo.id,
				html: photo.links.html,
				download: photo.links.download_location,
				user: {
					username: photo.user.username,
					name: photo.user.name,
					profile: photo.user.links.html,
				},
			});
		});

		return likedPhotos;
	}

	static async getCollections() {
		const {
			profile: { username },
		} = config.get('user');

		return await authenticatedRequest(`users/${username}/collections`);
	}

	static async likePhoto(id) {
		return await authenticatedRequest(`photos/${id}/like`, {
			method: 'POST',
		});
	}
}
