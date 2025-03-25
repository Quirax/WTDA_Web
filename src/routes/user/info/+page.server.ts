import { superValidate } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { userSchema } from '$lib/schema/register';
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
					username: table.user.username,
				},
			})
			.from(table.user)
			.where(eq(table.user.id, locals.user.id))
	).at(0);

	if (!results) throw redirect(302, '/');

	return {
		form: await superValidate(zod(userSchema), {
			defaults: results.user,
		}),
	};
}) satisfies PageServerLoad;
