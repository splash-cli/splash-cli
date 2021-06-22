import chalk from 'chalk';
import tlink from 'terminal-link';
import parseID from '@splash-cli/parse-unsplash-id';
import { registerPrompt, prompt } from 'inquirer';
import autocomplete from 'inquirer-autocomplete';
import fuzzy from 'fuzzy';

import { errorHandler, warnIfNotLogged, printBlock, authenticatedRequest } from '../extra/utils';
import { CollectionManager } from './libs/Collection';
import Aliases from './libs/Alias';
import User from './libs/User';
import * as TableUtility from '../extra/table-utility';
import Table from 'cli-table';

registerPrompt('autocomplete', autocomplete);

const searchCollections = (collections, defaultValue = '') => (answers, input) => {
	input = input || defaultValue || '';

	return new Promise(async (resolve) => {
		collections = collections.map((item) => chalk`{dim [${item.id}]} {yellow ${item.title}}`);
		const fuzzyResult = fuzzy.filter(input, collections);
		resolve(fuzzyResult.map((el) => el.original));
	});
};

// const searchCollections = (answers, input) => {
// 	input = input || '';

// 	return new Promise(async (resolve) => {
// 		User.getCollections()
// 			.then((collections) => {
// 				collections = collections
// 					.map(({ title, id, curated, updatedAt, description }) => ({
// 						id,
// 						title,
// 						curated,
// 						updatedAt,
// 						description,
// 					}))
// 					.map((item) => chalk`{dim [${item.id}]} {yellow ${item.title}}`);

// 				const fuzzyResult = fuzzy.filter(input, collections);
// 				resolve(fuzzyResult.map((el) => el.original));
// 			})
// 			.catch(errorHandler);
// 	});
// };

const getCreateQuestions = (name = null) => [
	{
		name: 'name',
		message: 'Name:',
		default: name,
	},
	{
		name: 'description',
		message: 'Description:',
	},
	{
		name: 'private',
		message: 'Is this collection private?',
		default: false,
		type: 'confirm',
	},
];

// TODO: finish to write this command
export default async function userCommand([cmd, input]) {
	warnIfNotLogged();
	let arg;

	try {
		if (cmd) {
			const [command, cmd_arg] = cmd
				.toString()
				.toLowerCase()
				.split(':');
			cmd = command;
			arg = cmd_arg;
		}

		switch (cmd) {
		case 'new':
		case 'create': {
			const { name, description, private: isPrivate } = await prompt(getCreateQuestions(input));
			const newCollection = await CollectionManager.create(name, description, isPrivate);

			if (!Aliases.has(name)) {
				Aliases.set(name, newCollection.id);
			}

			return userCommand(['get', `${newCollection.id}`]);
		}
		case 'photos': {
			switch (arg) {
			case 'add': {
				let photos = [];
				let collection_id = Aliases.get(input) || parseInt(input);

				let list = await User.getCollections();
				list = list.map(({ title, id, curated, updatedAt, description }) => ({
					id,
					title,
					curated,
					updatedAt,
					description,
				}));

				const { selectedCollectionID } = await prompt([
					{
						name: 'selectedCollectionID',
						type: 'autocomplete',
						message: 'Please choose a collection',
						source: (answers, input) => searchCollections(list)(answers, input),
						filter: (value) => parseInt(value.match(/\[(\d+)\].*?/i)[1].trim()),
					},
				]);

				collection_id = selectedCollectionID;

				const addPhotos = async (array) => {
					printBlock(chalk`{bold {yellow Press enter without typing anything to stop.}}`);
					const { photo_id } = await prompt([
						{
							name: 'photo_id',
							message: 'Photo ID or URL',
							prefix: chalk.green(`[+${array.length} photos]`),
							filter: (value) => (/exit|stop/gi.test(value) || !value ? 0 : value),
						},
					]);

					if (photo_id === 0) return;

					const id = parseID(photo_id);
					array.push(id);

					await addPhotos(array);
				};

				if (!collection_id) {
					errorHandler(new Error('Undefined collection_id'));
					process.exit();
				}

				await addPhotos(photos);

				await Promise.all(
					photos.map(
						async (photo) =>
							await authenticatedRequest(`collections/${collection_id}/add`, {
								method: 'POST',
								body: JSON.stringify({
									photo_id: photo,
								}),
								headers: {
									'Content-Type': 'application/json',
								},
							}),
					),
				);

				const response = await CollectionManager.get(`${collection_id}`);
				const { title: collection_title } = await response.info();

				printBlock(
					chalk`{green Success!} {magenta ${
						photos.length
					}} photos were successfully added to your collection: {bold {yellow "${collection_title}"}}`,
				);
				break;
			}
			case 'remove': {
				let photos = [];
				let collection_id = Aliases.get(input) || parseInt(input);

				let list = await User.getCollections();
				list = list.map(({ title, id, curated, updatedAt, description }) => ({
					id,
					title,
					curated,
					updatedAt,
					description,
				}));

				const { selectedCollectionID } = await prompt([
					{
						name: 'selectedCollectionID',
						type: 'autocomplete',
						message: 'Please choose a collection',
						source: (answers, input) => searchCollections(list)(answers, input),
						filter: (value) => parseInt(value.match(/\[(\d+)\].*?/i)[1].trim()),
					},
				]);

				collection_id = selectedCollectionID;

				const removePhotos = async (array) => {
					printBlock(chalk`{bold {yellow Press enter without typing anything to stop.}}`);
					const { photo_id } = await prompt([
						{
							name: 'photo_id',
							message: 'Photo ID or URL',
							prefix: chalk.green(`[+${array.length} photos]`),
							filter: (value) => (/exit|stop/gi.test(value) || !value ? 0 : value),
						},
					]);

					if (photo_id === 0) return;

					const id = parseID(photo_id);
					array.push(id);

					await removePhotos(array);
				};

				if (!collection_id) {
					errorHandler(new Error('Undefined collection_id'));
					process.exit();
				}

				await removePhotos(photos);

				await Promise.all(
					photos.map(
						async (photo) =>
							await authenticatedRequest(`collections/${collection_id}/remove`, {
								method: 'DELETE',
								body: JSON.stringify({
									photo_id: photo,
								}),
								headers: {
									'Content-Type': 'application/json',
								},
							}),
					),
				);

				const response = await CollectionManager.get(`${collection_id}`);
				const { title: collection_title } = await response.info();

				printBlock(
					chalk`{green Success!} {magenta ${
						photos.length
					}} photos were successfully removed from your collection: {bold {yellow "${collection_title}"}}`,
				);
				break;
			}
			default: {
				if (!arg) return userCommand(['help']);
				printBlock(chalk`Unknown command "{red {bold ${cmd}}}"`);
				break;
			}
			}
		}
		case 'get': {
			let collection = await CollectionManager.get(input);
			collection = await collection.info();

			printBlock(chalk`
{yellow {bold ${collection.title}}} [{cyan ${collection.total_photos}} photos]
by {underline ${collection.user.name}} a.k.a {underline @${collection.user.username}}

View more ${tlink('here', collection.links.html)}
`);
			break;
		}
		case 'delete': {
			let cID = input;
			input = Aliases.get(input) || parseInt(input);

			if (!input) {
				let list = await User.getCollections();
				list = list.map(({ title, id, curated, updatedAt, description }) => ({
					id,
					title,
					curated,
					updatedAt,
					description,
				}));

				const { collectionID } = await prompt([
					{
						name: 'collectionID',
						type: 'autocomplete',
						message: 'Please choose a collection',
						source: (answers, input) => searchCollections(list)(answers, input),
						filter: (value) => parseInt(value.match(/\[(\d+)\].*?/i)[1].trim()),
					},
				]);

				cID = collectionID;
			}

			const { confirmed } = await prompt({
				type: 'confirm',
				message: 'Are you sure?',
				name: 'confirmed',
			});

			if (!confirmed) {
				printBlock('Operation aborted by the user.');
				process.exit(1);
			}

			const { statusCode, statusMessage } = await CollectionManager.delete(cID);
			if (statusCode === 204) return printBlock(`Collection ${cID} deleted successfully!`);
			return printBlock(`${statusCode} - ${statusMessage}`);
		}
		case 'help':
		case 'h':
		case 'how': {
			const commands = TableUtility.mapTableContent([
				[chalk`get {gray <id>}`, 'null', 'GET COLLECTION INFOS'],
				[chalk`delete {gray <id>}`, 'null', 'DELETE A COLLECTION'],
				['create', 'make', 'CREATE A NEW COLLECTION'],
				[chalk`photos{gray :add}`, 'null', 'ADD PHOTOS TO A COLLECTION'],
				[chalk`photos{gray :remove}`, 'null', 'REMOVE PHOTOS FROM A COLLECTION'],
				['help', 'how', 'SHOWS THIS MESSAGE'],
			]);

			const table = new Table(TableUtility.helpTableConfiguration);
			table.push(...commands);

			printBlock(chalk`{yellow ~ {bold COLLECTIONS HELP} ~}`, '', table.toString());
			break;
		}
		default: {
			if (!cmd) return userCommand(['help']);
			printBlock(chalk`Unknown command "{red {bold ${cmd}}}"`);
		}
		}
	} catch (error) {
		errorHandler(error);
	}
}
