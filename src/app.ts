// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

import type EmailConfirm from '$lib/server/mail/emailConfirm.svelte';

declare global {
	namespace App {
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
}

export enum EmailConfirmFor {
	REGISTRATION = 'REGISTRATION',
	RESET_PASSWORD = 'RESET_PASSWORD',
}
