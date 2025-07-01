import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { fail, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { passwordSchema } from '$lib/schema/userInfo';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import * as auth from '$lib/server/auth';
import { _adminCookie } from '../+layout.server';
import { UserRole } from '@app';

export const load = (async ({ locals }) => {
	if (!locals.user) throw error(401);

	return {
		form: await superValidate(zod(passwordSchema)),
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event.request, zod(passwordSchema));

		if (!form.valid) {
			return fail(400, { message: 'The form is not valid.', formData: form.data });
		}

		const { password } = form.data;

		const results = await db
			.select()
			.from(table.user)
			.where(eq(table.user.id, event.locals.user!.id));

		const existingUser = results.at(0);
		if (!existingUser) {
			return fail(404, { message: 'Not found matched user' });
		}

		const validPassword = await auth.validatePassword(existingUser.passwordHash, password);
		if (!validPassword) {
			return fail(404, { message: 'Not found matched user' });
		}

		if (existingUser.role !== UserRole.ADMIN)
			return fail(403, { message: 'You are not granted to access' });

		event.cookies.set(_adminCookie, auth.generateSessionToken(), {
			expires: new Date(Date.now() + 10 * 60 * 1000),
			path: '/admin',
		});

		return redirect(302, '/admin');
	},
};
