import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

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
