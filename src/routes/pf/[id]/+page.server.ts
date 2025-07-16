import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { AdultContents, ErrorCode } from '@app';
import { isAdult } from '$lib/utils';

export const load = (async ({ params, locals }) => {
	const id = params.id;

	const article = (
		await db
			.select({
				id: table.portfolio.id,
				thumbnail: table.portfolio.thumbnail,
				title: table.portfolio.title,
				author: {
					id: table.user.id,
					username: table.user.username,
					profileImage: table.user.profileImage,
					email: table.user.email,
					preferences: table.user.preferences,
					profile: table.user.profile,
					birthday: table.user.birthday,
					authExpiresAt: table.user.authExpiresAt,
					role: table.user.role,
				},
				category: table.portfolio.category,
				tags: table.portfolio.tags,
				createDate: table.portfolio.createDate,
				modifyDate: table.portfolio.modifyDate,
				content: table.portfolio.content,
				containsAdultContents: table.portfolio.containsAdultContents,
				media: table.portfolio.media,
				publishDate: table.portfolio.publishDate,
			})
			.from(table.portfolio)
			.where(eq(table.portfolio.id, id))
			.innerJoin(table.user, eq(table.portfolio.author, table.user.id))
	).at(0);

	if (!article) throw error(404, { message: 'Cannot find matched request' });

	if (article.containsAdultContents !== AdultContents.NORMAL) {
		if (!isAdult(locals.user)) {
			throw error(451, {
				code: ErrorCode.ADULT_RESTRICTED,
				message: "It's unavailable for legal reasons",
			});
		}
	}

	return {
		article,
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	delete: async ({ params, locals }) => {
		const id = params.id;

		if (!locals.user) throw redirect(302, '/');
		if (!locals.session) throw redirect(302, '/');

		try {
			const article = (
				await db
					.select({
						author: table.portfolio.author,
					})
					.from(table.portfolio)
					.where(eq(table.portfolio.id, id))
			).at(0);

			if (article?.author !== locals.user.id)
				return fail(403, { message: 'Not authorized to delete the article' });

			await db.delete(table.portfolio).where(eq(table.portfolio.id, id));
		} catch (e: any) {
			console.error(e);
			return fail(500, { message: 'An error has occurred' });
		}

		return { message: 'Deletion of the article completed' };
	},
};
