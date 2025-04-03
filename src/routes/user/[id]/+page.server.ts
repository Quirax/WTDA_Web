import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';
import { announcementsPerPage } from '$lib/config';

export const load = (async ({ params, locals }) => {
	const id = params.id;

	// 내 프로필로 접근하려는 경우
	if (id === '@me') {
		if (locals.user) throw redirect(302, '/user/' + locals.user.id);
		else throw redirect(302, '/login');
	}

	const user = (
		await db
			.select({
				username: table.user.username,
				profileImage: table.user.profileImage,
				email: table.user.email,
				preferences: table.user.preferences,
				profile: table.user.profile,
				id: table.user.id,
			})
			.from(table.user)
			.where(eq(table.user.id, id))
	).at(0);

	if (!user) throw error(404, { message: 'Cannot find matched user' });

	const profileAnnouncements = (
		await db
			.select()
			.from(table.profileAnnouncements)
			.where(eq(table.profileAnnouncements.userId, id))
			// ref: https://stackoverflow.com/a/79132920
			.orderBy(desc(table.profileAnnouncements.createDate))
			// ref: https://orm.drizzle.team/docs/select#limit--offset
			.limit(1)
	).at(0);

	return {
		user,
		profileAnnouncements,
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	announcementsList: async ({ params, request }) => {
		const id = params.id;
		const page = parseInt(((await request.formData()).get('page') as string | null) || '1');

		return {
			message: 'Got announcements List',
			list: Array(5)
				.fill(undefined)
				.map((_, idx) => ({
					title: `공지 ${5 - idx}`,
					createDate: new Date(`2025-04-03 ${idx + 9}:00`),
				})),
		};

		try {
			const announcements = await db
				.select({
					title: table.profileAnnouncements.title,
					createDate: table.profileAnnouncements.createDate,
				})
				.from(table.profileAnnouncements)
				.where(eq(table.profileAnnouncements.userId, id))
				// ref: https://stackoverflow.com/a/79132920
				.orderBy(desc(table.profileAnnouncements.createDate))
				// ref: https://orm.drizzle.team/docs/select#limit--offset
				.limit(announcementsPerPage)
				.offset(announcementsPerPage * (page - 1));

			return { message: 'Got announcements List', list: announcements };
		} catch (e) {
			console.error(e);
			return fail(500, { message: 'An error has occurred' });
		}
	},
};
