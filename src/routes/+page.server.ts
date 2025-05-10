import { fail, redirect } from '@sveltejs/kit';
import { AdultContents, ArticleType, UserStatus } from '../app';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, desc, sql, ne, and } from 'drizzle-orm';
import { articlesPerType } from '$lib/server/db/shorthands';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user?.status === UserStatus.REQUIRED_EMAIL_CONFIRM)
		throw redirect(302, '/register/email-confirm');
	if (locals.user?.status === UserStatus.DEACTIVATED)
		// Force logout deactivated user
		throw redirect(302, '/logout');

	try {
		const [requests] = await Promise.all(
			articlesPerType([ArticleType.REQUEST], {}, locals.user).map((v) => v?.limit(10)),
		);

		return { requests };
	} catch (e) {
		console.error(e);
		return fail(500, { message: 'An error has occurred' });
	}
};
