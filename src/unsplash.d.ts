type Identifiable<T = number> = {
	id: T;
}

export namespace Unsplash {
	interface Photo extends Identifiable<string> {

	}

	interface User extends Identifiable {

	}

	interface Collection extends Identifiable {

	}
}
