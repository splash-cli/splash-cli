declare module "@splash-cli/printblock" {
	function printBlock(...args: any[]): void;
	export default printBlock;
}

declare module "@splash-cli/is-month" {
	function isMonth(month: string): boolean;
	export default isMonth;
}

declare module "@splash-cli/parse-unsplash-id" {
	function parseID(id: string): string;
	export default parseID;
}

declare module "@splash-cli/show-copy" {
	function showCopy(photo: any, info: boolean): void;
	export default showCopy;
}

declare module "wallpaper" {
	export type Screen = number | "all" | "main";
	export type Scale = "auto" | "fill" | "fit" | "stretch" | "center";

	export interface WallpaperSetOptions {
		scale?: "auto" | "fill" | "fit" | "stretch" | "center";
		screen?: number | "all" | "main";
	}

	export interface WallpaperGetOptions {
		screen?: number | "all" | "main";
	}

	export function get(options?: WallpaperGetOptions): Promise<string>;
	export function set(imagePath: string, options?: WallpaperSetOptions): Promise<void>;
	export function screens(): string[];
}

declare module "is-image" {
	function isImage(imagePath: string): boolean;
	export default isImage;
}

declare module "simple-download" {
	export default class RemoteFile {
		constructor(url: string, name: string);
		download(): {
			dir: string;
			base: string;
		};
	}
}

declare module "conf" {
	export default class Conf {
		path: string
		constructor(options: any)
		get(key?: string, defaultValue?: any): any
		has(key?: string): boolean
		delete(key?: string): void
		set(key?: string, value?: any): any
	}
}
