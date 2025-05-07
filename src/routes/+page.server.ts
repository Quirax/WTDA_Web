import { fail, redirect } from '@sveltejs/kit';
import { AdultContents, ArticleType, UserStatus } from '../app';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, desc, sql, ne, and } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user?.status === UserStatus.REQUIRED_EMAIL_CONFIRM)
		throw redirect(302, '/register/email-confirm');
	if (locals.user?.status === UserStatus.DEACTIVATED)
		// Force logout deactivated user
		throw redirect(302, '/logout');

	const where = [];

	if (!locals.user || !locals.user.preferences.display_adult_contents)
		where.push(eq(table.commissionRequest.containsAdultContents, AdultContents.NORMAL));
	else if (!locals.user.preferences.display_grotesque_contents)
		where.push(
			ne(table.commissionRequest.containsAdultContents, AdultContents.GROTESQUE_RESTRICTED),
		);

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
			.where(and(...where))
			.innerJoin(table.user, eq(table.commissionRequest.author, table.user.id))
			.orderBy(desc(table.commissionRequest.modifyDate))
			.limit(10);

		return { requests };
	} catch (e) {
		console.error(e);
		return fail(500, { message: 'An error has occurred' });
	}
};
