// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

import type { Link } from '$lib/config';

declare global {
	type NumberEnumerate<N extends number, Acc extends number[] = []> = Acc['length'] extends N
		? Acc[number]
		: NumberEnumerate<N, [...Acc, Acc['length']]>;

	type NumberRange<F extends number, T extends number> = Exclude<
		NumberEnumerate<T>,
		NumberEnumerate<F>
	>;

	namespace App {
		interface Range<T> {
			from: T;
			to: T;
		}

		interface Preferences {
			agree_marketing: boolean;
		}

		interface Profile {
			headerImage: string;
			introduction: string;
			contactAvailable: boolean | Range<NumberEnumerate<24>>;
			links: Link[];
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
