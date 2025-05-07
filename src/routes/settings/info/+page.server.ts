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
				user: {
					preferences: table.user.preferences,
				},
			})
			.from(table.user)
			.where(eq(table.user.id, userId))
	).at(0);

	if (!results) throw redirect(302, '/');

	const preferences = results.user.preferences as Partial<App.Preferences>;

	return {
		agree_marketing: preferences.agree_marketing || false,
		display_adult_contents: preferences.display_adult_contents || false,
		display_grotesque_contents: preferences.display_grotesque_contents || false,
	};
};

export const load = (async ({ locals }) => {
	if (!locals.user) throw redirect(302, '/');

	return {
		form: await superValidate(zod(userSchema), {
			defaults: await _getPreferences(locals.user.id),
		}),
	};
}) satisfies PageServerLoad;

export const _userInfoEditCookie = 'user-info-edit';
