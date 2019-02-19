interface Flags {
	quiet: boolean;
	day: boolean;
	id: string;
	info: boolean;
	set: string;
	save?: string;
	curated: boolean;
	user: string;
	collection: string;
	featured: boolean;
	query: string;
	scale: "auto" | "fill" | "fit" | "stretch" | "center";
	screen: string;
	help: boolean;
	version: boolean;
}

interface DefaultSettings {
	user?: SettingsUser | null;
	lastWP: string | null;
	"confirm-wallpaper": boolean;
	directory: string;
	aliases: {
		name: string;
		id: number;
	}[];
	userFolder: boolean;
	counter: number;
	askForLike: boolean;
	askForCollection: boolean;
	picOfTheDay: {
		date: {
			lastUpdate: number;
			delay: number;
		};
	};
}

interface AliasItem {
	name: string;
	id: string | number;
}
