import { error, fail, redirect } from '@sveltejs/kit';
import { AdultContents, ArticleType, UserStatus } from '../app';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, desc, sql, ne, and } from 'drizzle-orm';
import { articlesPerType } from '$lib/server/db/shorthands';
import { firebaseAdmin } from '$lib/server/firebase';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user?.status === UserStatus.REQUIRED_EMAIL_CONFIRM)
		throw redirect(302, '/register/email-confirm');
	if (locals.user?.status === UserStatus.DEACTIVATED)
		// Force logout deactivated user
		throw redirect(302, '/logout');

	try {
		const [requests] = await Promise.all(
			articlesPerType([ArticleType.REQUEST], {}, locals.user).map((v) =>
				v?.orderBy(desc(v._.selectedFields.modifyDate)).limit(10),
			),
		);

		return { requests };
	} catch (e) {
		console.error(e);
		return error(500, { message: 'An error has occurred' });
	}
};

export const actions: Actions = {
	registerNotificationToken: async ({ locals, request }) => {
		if (!locals.user) return;

		const token = (await request.formData()).get('token') as string;

		try {
			const tokens =
				(
					await db
						.select({ tokens: table.user.notificationToken })
						.from(table.user)
						.where(eq(table.user.id, locals.user.id))
				).at(0)?.tokens || [];

			if (tokens.indexOf(token) === -1) tokens.push(token);

			await db
				.update(table.user)
				.set({
					notificationToken: tokens,
				})
				.where(eq(table.user.id, locals.user.id));

			return { message: 'Registered the notification token' };
		} catch (e) {
			console.error(e);
			return fail(500, { message: 'An error has occurred' });
		}
	},
};
