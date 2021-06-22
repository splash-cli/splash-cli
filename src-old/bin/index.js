#! /usr/bin/env node

import Meow from 'meow';
import client from '../client';
import help from './help';

const { input, flags } = Meow(help, {
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
		rotate: 'string',
		colorspace: 'string',
		flip: 'boolean',
		grayscale: 'boolean',
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
