import { redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { userSchema } from '$lib/schema/userInfo';
import { _userInfoEditCookie } from '../+page.server';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load = (async (event) => {
	if (!event.locals.user) throw redirect(302, '/');

	const userInfoEditToken = event.cookies.get(_userInfoEditCookie);

	if (!userInfoEditToken) throw redirect(302, '/user/info');

	event.cookies.delete(_userInfoEditCookie, {
		path: '/',
	});

	const results = (
		await db
			.select({
				user: {
					username: table.user.username,
					profileImage: table.user.profileImage,
				},
			})
			.from(table.user)
			.where(eq(table.user.id, event.locals.user.id))
	).at(0);

	if (!results) throw redirect(302, '/');

	return {
		form: await superValidate(zod(userSchema), {
			defaults: results.user,
		}),
	};
}) satisfies PageServerLoad;
