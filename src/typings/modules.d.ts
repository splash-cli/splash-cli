declare module '@splash-cli/is-month' {
	export default function isMonth(month: string): boolean;
}

declare module '@splash-cli/print-block' {
	export default function printBlock(...args: string[]): void;
}

declare module '@splash-cli/parse-unsplash-id' {
	export default function parseUnsplashId(id: string): string;
}

declare module '@splash-cli/show-copy';

declare module 'dotenv' {
	export function load(): void;
	export function config(): void;
}

declare module 'conf' {
	export default class Conf<T> {
		constructor(options: { defaults: any });

		set: (key: keyof T, value: any) => void;
		get: (key?: keyof T, defaultValue?: T[keyof T] | any) => any;
		has: (key: keyof T) => boolean;
		delete: (key: keyof T) => void;
	}
}

declare module 'is-image' {
	export default function isImage(path: string): boolean;
}

declare module 'normalize-url' {
	export default function normalize(url: string): string;
}

declare module 'ora';
declare module 'first-run';
declare module 'wallpaper';
declare module 'terminal-link';
declare module 'simple-download';
declare module 'figures';
