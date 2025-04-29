import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

export const load = (async ({ params }) => {
	const id = params.id;

	const article = (
		await db
			.select({
				id: table.commissionRequest.id,
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
				createDate: table.commissionRequest.createDate,
				modifyDate: table.commissionRequest.modifyDate,
				content: table.commissionRequest.content,
				containsAdultContents: table.commissionRequest.containsAdultContents,
				budget: table.commissionRequest.budget,
				deadline: table.commissionRequest.deadline,
				isForCommercial: table.commissionRequest.isForCommercial,
				purpose: table.commissionRequest.purpose,
				visibleOnlyToCommissioner: table.commissionRequest.visibleOnlyToCommissioner,
			})
			.from(table.commissionRequest)
			.where(eq(table.commissionRequest.id, id))
			.innerJoin(table.user, eq(table.commissionRequest.author, table.user.id))
	).at(0);

	if (!article) throw error(404, { message: 'Cannot find matched request' });

	if (article.visibleOnlyToCommissioner) {
		// 커미션주인지 확인
	}

	if (article.containsAdultContents) {
		// 성인 콘텐츠를 열람할 수 있는지 확인
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
						author: table.commissionRequest.author,
					})
					.from(table.commissionRequest)
					.where(eq(table.commissionRequest.id, id))
			).at(0);

			if (article?.author !== locals.user.id)
				return fail(403, { message: 'Not authorized to delete the article' });

			// TODO: 이 의뢰를 기반으로 한 커미션 계약이 있는 경우, 삭제 불가

			await db.delete(table.commissionRequest).where(eq(table.commissionRequest.id, id));
		} catch (e: any) {
			console.error(e);
			return fail(500, { message: 'An error has occurred' });
		}

		return { message: 'Deletion of the article completed' };
	},
};
