import got from 'got';
import os from 'os';

import dotenv from 'dotenv';
import { prompt } from 'inquirer';
import { errorHandler } from './utils';

import config from './storage';

dotenv.config();

export default class SentryAPIClient {
	BASE_URL = 'https://sentry.io/api/0';
	DSN = process.env.SENTRY_DSN;

	static shared = new SentryAPIClient();

	async userFeedBack(error, event_id) {
		if (!event_id || !this.DSN) {
			console.table({ event_id, dsn: this.DSN });
			return console.log('NOT A VALID EVENT_ID/DSN');
		}

		const { confirmed, ...payload } = await prompt([
			{
				name: 'name',
				message: 'Your name',
				default: os.userInfo().username,
			},
			{
				name: 'email',
				message: 'Your Email address',
				validate: (text) => (text.includes('@') ? true : 'Insert a valid email address'),
				default: config.get('userEmail'),
			},
			{
				name: 'comments',
				message: 'Comment',
				type: 'editor',
				default:
					error != null && Object.keys(error).length
						? `
// ERROR
${JSON.stringify(error, null, 2)}

// MESSAGE
`
						: undefined,
			},
			{
				name: 'confirmed',
				message: 'Confirm?',
				type: 'confirm',
			},
		]);

		config.set('userEmail', payload.email);

		try {
			// FIXME: 400 BAD REQUEST issue: #69
			await got(`${this.BASE_URL}/projects/federico-vitale/splash-cli/user-feedback/`, {
				method: 'POST',
				body: JSON.stringify({ ...payload, event_id }),
				headers: {
					'Content-Type': 'application/json',
					Authorization: `DSN ${process.env.SENTRY_DSN.trim()}`,
				},
			});
		} catch (e) {
			errorHandler(e);
		}
	}
}
