import { superValidate } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { userSchema } from '$lib/schema/userInfo';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load = (async ({ locals }) => {
	if (!locals.user) throw redirect(302, '/');

	const results = (
		await db
			.select({
				user: {
					preferences: table.user.preferences,
				},
			})
			.from(table.user)
			.where(eq(table.user.id, locals.user.id))
	).at(0);

	if (!results) throw redirect(302, '/');

	return {
		form: await superValidate(zod(userSchema), {
			defaults: {
				agree_marketing:
					(results.user.preferences as Partial<{ agree_marketing: boolean }>).agree_marketing ||
					false,
			},
		}),
	};
}) satisfies PageServerLoad;

export const _userInfoEditCookie = 'user-info-edit';
