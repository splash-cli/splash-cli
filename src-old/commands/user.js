import { prompt } from 'inquirer';
import chalk from 'chalk';

import { errorHandler, warnIfNotLogged, printBlock } from '../extra/utils';
import config from '../extra/storage';
import User from './libs/User';
import * as TableUtility from '../extra/table-utility';
import Table from 'cli-table';

export default async function userCommand([cmd]) {
	try {
		if (cmd) cmd = cmd.toString().toLowerCase();

		switch (cmd) {
		case 'login':
			await User.auth.login();
			break;
		case 'logout':
			const success = User.auth.logout();
			if (!success) return console.log(chalk`{bold {red Aborted}}`);

			printBlock(chalk`User data {bold deleted} successfully.`);
			process.exit();
			break;
		case 'update':
		case 'edit':
			warnIfNotLogged();

			const { profile: user } = config.get('user') || {};

			const data = await prompt([
				{
					name: 'username',
					message: 'Username',
					default: user.username,
				},
				{
					name: 'firstName',
					message: 'First Name:',
					default: user.first_name,
				},
				{
					name: 'lastName',
					message: 'Last Name',
					default: user.last_name,
				},
				{
					name: 'bio',
					message: 'Bio',
					default: user.bio,
				},
				{
					name: 'instagramUsername',
					message: 'Instagram Username',
					default: user.instagram_username,
				},
				{
					name: 'location',
					message: 'Location',
					default: user.location,
				},
				{
					name: 'url',
					message: 'Url',
					default: user.url,
				},
			]);

			const newUser = await User.update(data);

			if (newUser.error || newUser.errors) return printBlock(newUser.error || newUser.errors);

			userCommand(['get']);
			break;
		case 'get-collections':
		case 'collections':
			warnIfNotLogged();
			let collections = await User.getCollections();
			collections = collections
				.map(({ title, id, curated, updatedAt, description }) => ({
					id,
					title,
					curated,
					updatedAt,
					description,
				}))
				.sort(({ updatedAt: first_updatedAt }, { updatedAt: second_updatedAt }) => {
					const a = new Date(first_updatedAt).getTime();
					const b = new Date(second_updatedAt).getTime();

					return a - b;
				});

			printBlock(chalk`{bold {black {bgYellow All your collections ({dim ${collections.length}}):}}}`);
			collections.map(({ title, curated, description, id }, index) => {
				console.log(
					chalk`{yellow ${index + 1}}${
						!!curated ? chalk`[{bgGreen curated}]` : ''
					} — {bold ${title}} ({cyan #${id}})`,
				);
				if (description) {
					console.log(chalk`{dim ${description}}`);
					console.log('');
				}
			});

			break;
		case 'likes':
		case 'get-likes':
		case 'liked':
			warnIfNotLogged();
			const likes = await User.getLikes();

			printBlock(chalk`{bold {black {bgYellow Last 10 liked photos:}}}`);

			likes.forEach((photo) => {
				console.log(chalk`{bold {yellow ID:}} ${photo.id}`);
				console.log(chalk`{bold {yellow Author:}} {cyan @${photo.user.username}}`);
				console.log(chalk`{bold {yellow Link:}} {underline ${photo.html}}`);
				console.log(chalk`{dim -}`.repeat(10));
				console.log();
			});

			break;
		case 'get':
			warnIfNotLogged();
			printBlock(await User.get());
			break;
		case 'help':
		case 'how':
		case 'h':
			const commands = TableUtility.mapTableContent([
				['login', 'null'],
				['logout', 'null'],
				['liked', ['likes', 'get-likes'], 'GET LAST 10 LIKED PHOTOS'],
				['collections', 'get-collections', 'GET ALL YOUR COLLECTIONS (WITH ID)'],
				['get', 'null', 'CURRENT USER INFOS'],
				['edit', 'update', 'EDIT USER'],
				['help', 'how', 'SHOWS THIS MESSAGE'],
			]);

			const table = new Table(TableUtility.helpTableConfiguration);

			table.push(...commands);

			printBlock(chalk`{yellow ~ {bold USER HELP} ~}`, '', table.toString());
			break;
		default:
			if (!cmd) {
				return userCommand(['help']);
			}

			printBlock(
				chalk`{yellow Sorry!} Option: {yellow "${cmd}"} currently {underline {red not available}}.`,
				'',
				chalk`Type "{yellow user {bold help}}" for more infos`,
			);
			break;
		}
	} catch (error) {
		errorHandler(error);
	}
}
