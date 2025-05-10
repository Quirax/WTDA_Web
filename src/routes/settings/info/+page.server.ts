import { superValidate } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { userSchema } from '$lib/schema/userInfo';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const _getPreferences = async (userId: string) => {
	const results = (
		await db
			.select({
				preferences: table.user.preferences,
				status: table.user.status,
				birthday: table.user.birthday,
				authExpiresAt: table.user.authExpiresAt,
			})
			.from(table.user)
			.where(eq(table.user.id, userId))
	).at(0);

	if (!results) throw redirect(302, '/');

	const preferences = results.preferences as Partial<App.Preferences>;

	return {
		form: {
			agree_marketing: preferences.agree_marketing || false,
			display_adult_contents: preferences.display_adult_contents || false,
			display_grotesque_contents: preferences.display_grotesque_contents || false,
		},
		auth: {
			status: results.status,
			birthday: results.birthday,
			authExpiresAt: results.authExpiresAt,
		},
	};
};

export const load = (async ({ locals }) => {
	if (!locals.user) throw redirect(302, '/');

	const preferences = await _getPreferences(locals.user.id);

	return {
		form: await superValidate(zod(userSchema), {
			defaults: preferences.form,
		}),
		auth: preferences.auth,
	};
}) satisfies PageServerLoad;

export const _userInfoEditCookie = 'user-info-edit';
