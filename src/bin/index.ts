#! /usr/bin/env node

import Meow from 'meow';
import help from './help';
import client from '../client';

const { input, flags } = Meow(help, {
	version: 'v0.0.0',
	flags: {
		help: {
			type: 'boolean',
			alias: 'h',
		},
		version: {
			type: 'boolean',
			alias: 'v',
		},
		set: {
			type: 'string',
		},
		collection: {
			type: 'string',
		},
		day: {
			type: 'boolean',
		},
		featured: {
			type: 'boolean',
			alias: 'f',
		},
		quiet: {
			type: 'boolean',
			alias: 'q',
		},
		user: {
			type: 'string',
			alias: 'u',
		},
		settings: {
			type: 'boolean',
		},
		id: {
			type: 'string',
		},
		query: {
			type: 'string',
		},
		orientation: {
			type: 'string',
			alias: 'o',
		},
		save: {
			type: 'string',
			alias: 's',
		},
		info: {
			type: 'boolean',
			alias: 'i',
		},
		scale: 'string',
		screen: 'string',
	},
});

client(input, flags);
