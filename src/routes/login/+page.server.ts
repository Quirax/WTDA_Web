import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { formSchema } from '$lib/schema/login';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import * as auth from '$lib/server/auth';
import { eq } from 'drizzle-orm';
import { UserStatus } from '../../app';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) throw redirect(302, '/');

	return {
		form: await superValidate(zod(formSchema)),
	};
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event.request, zod(formSchema));

		if (!form.valid) {
			return fail(400, { message: 'The form is not valid.', formData: form.data });
		}

		const { email, password } = form.data;

		const results = await db.select().from(table.user).where(eq(table.user.email, email));

		const existingUser = results.at(0);
		if (!existingUser) {
			return fail(404, { message: 'Not found matched user' });
		}

		const validPassword = await auth.validatePassword(existingUser.passwordHash, password);
		if (!validPassword) {
			return fail(404, { message: 'Not found matched user' });
		}

		const sessionToken = auth.generateSessionToken();
		const session = await auth.createSession(sessionToken, existingUser.id);
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);

		if (existingUser.status === UserStatus.REQUIRED_EMAIL_CONFIRM)
			return redirect(302, '/register/email-confirm');
		else return redirect(302, '/');
	},
};
