import { fail, redirect } from '@sveltejs/kit';
import { ArticleType, UserStatus } from '../app';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user?.status === UserStatus.REQUIRED_EMAIL_CONFIRM)
		throw redirect(302, '/register/email-confirm');
	if (locals.user?.status === UserStatus.DEACTIVATED)
		// Force logout deactivated user
		throw redirect(302, '/logout');

	try {
		const requests = await db
			.select({
				id: table.commissionRequest.id,
				type: sql<ArticleType>`'REQUEST'`,
				thumbnail: table.commissionRequest.thumbnail,
				title: table.commissionRequest.title,
				author: {
					id: table.user.id,
					username: table.user.username,
					profileImage: table.user.profileImage,
					email: table.user.email,
					preferences: table.user.preferences,
					profile: table.user.profile,
				},
				category: table.commissionRequest.category,
				tags: table.commissionRequest.tags,
				modifyDate: table.commissionRequest.modifyDate,
			})
			.from(table.commissionRequest)
			.innerJoin(table.user, eq(table.commissionRequest.author, table.user.id))
			.orderBy(desc(table.commissionRequest.modifyDate))
			.limit(10);

		return { requests };
	} catch (e) {
		console.error(e);
		return fail(500, { message: 'An error has occurred' });
	}
};
