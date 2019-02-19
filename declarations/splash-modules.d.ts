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
