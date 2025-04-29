// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

import type { Link } from '$lib/config';
import type { CommissionRequest } from '$lib/server/db/schema';

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
			accentColor: string;
		}

		type User = import('$lib/server/auth').SessionValidationResult['user'];
		type Session = import('$lib/server/auth').SessionValidationResult['session'];

		type ProfileAnnouncements = import('$lib/server/db/schema').ProfileAnnouncements;

		interface Articles {
			thumbnail: string | null;
			title: string;
			author: Omit<NonNullable<User>, 'status'>;
			category: ArticleCategory;
			tags: string[] | null;
			id: string;
			type?: ArticleType;
		}

		type CommisionType = Articles & {};
		type Request = Omit<CommissionRequest, 'author'> & {
			author: Omit<NonNullable<User>, 'status'>;
		};

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

export enum FetchStatus {
	LOADING,
	FAILED,
	COMPLETED,
}

export enum ArticleCategory {
	TEXT = 'TEXT',
	DRAWING = 'DRAWING',
}

export enum ArticleType {
	REQUEST = 'REQUEST',
	COMMISSION = 'COMMISSION',
}
