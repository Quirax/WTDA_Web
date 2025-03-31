import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

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
			})
			.from(table.user)
			.where(eq(table.user.id, id))
	).at(0);

	if (!user) throw error(404, { message: 'Cannot find matched user' });

	return {
		user,
	};
}) satisfies PageServerLoad;
