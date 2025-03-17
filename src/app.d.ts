// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

declare global {
	namespace App {
		type User = import('$lib/server/auth').SessionValidationResult['user'];
		type Session = import('$lib/server/auth').SessionValidationResult['session'];

		interface Articles {
			thumbnail: string;
			title: string;
			author: NonNullable<User>;
			category: string;
			tags: string[]?;
		}

		type CommisionType = Articles & {};
		type Request = Articles & {};

		interface Locals {
			user: User;
			session: Session;
		}
	}
}

export {};
