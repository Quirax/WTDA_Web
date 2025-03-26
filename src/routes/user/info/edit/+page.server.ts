import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { userSchema } from '$lib/schema/userInfo';
import { _userInfoEditCookie } from '../+page.server';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { getPasswordHash } from '$lib/server/auth';

export const load = (async (event) => {
	if (!event.locals.user) throw redirect(302, '/');

	const userInfoEditToken = event.cookies.get(_userInfoEditCookie);

	if (!userInfoEditToken) throw redirect(302, '/user/info');

	// event.cookies.delete(_userInfoEditCookie, {
	// 	path: '/',
	// });

	const results = (
		await db
			.select({
				user: {
					username: table.user.username,
					profileImage: table.user.profileImage,
					preferences: table.user.preferences,
				},
			})
			.from(table.user)
			.where(eq(table.user.id, event.locals.user.id))
	).at(0);

	if (!results) throw redirect(302, '/');

	return {
		form: await superValidate(zod(userSchema), {
			defaults: {
				username: results.user.username,
				profileImage: results.user.profileImage,
				agree_marketing:
					(results.user.preferences as Partial<{ agree_marketing: boolean }>).agree_marketing ||
					false,
			},
		}),
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	do: async (event) => {
		if (!event.locals.user) throw redirect(302, '/');

		const form = await superValidate(event.request, zod(userSchema));

		if (!form.valid) {
			return fail(400, { message: 'The form is not valid.', form });
		}

		const { password, username, profileImage, agree_marketing } = form.data;

		let set: Partial<{
			username: typeof username;
			profileImage: typeof profileImage;
			preferences: {
				agree_marketing: typeof agree_marketing;
			};
		}> &
			Partial<{ passwordHash: string }> = {
			username,
			profileImage,
			preferences: {
				agree_marketing,
			},
		};

		if (password) set = { ...set, passwordHash: await getPasswordHash(password) };

		console.log(set);

		try {
			await db.update(table.user).set(set).where(eq(table.user.id, event.locals.user.id));
		} catch (e: any) {
			console.error(e);
			return fail(500, { message: 'An error has occurred', error: e, form });
		}

		return redirect(302, '/user/info');
	},
};
