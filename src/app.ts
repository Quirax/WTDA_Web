// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

declare global {
	namespace App {
		interface Preferences {
			agree_marketing: boolean;
		}

		interface Profile {
			headerImage: string;
		}

		type User = import('$lib/server/auth').SessionValidationResult['user'];
		type Session = import('$lib/server/auth').SessionValidationResult['session'];

		interface Articles {
			thumbnail: string;
			title: string;
			author: NonNullable<User>;
			category: string;
			tags: string[] | null;
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

export enum UserStatus {
	REQUIRED_EMAIL_CONFIRM = 'REQUIRED_EMAIL_CONFIRM',
	NOT_AUTHENTICATED = 'NOT_AUTHENTICATED',
	AUTHENTICATED = 'AUTHENTICATED',
	DEACTIVATED = 'DEACTIVATED',
}

export enum EmailConfirmFor {
	REGISTRATION = 'REGISTRATION',
	RESET_PASSWORD = 'RESET_PASSWORD',
}
