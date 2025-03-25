import type { Actions, PageServerLoad } from './$types';
import { superForm, superValidate } from 'sveltekit-superforms';
import { formSchema } from '$lib/schema/register';
import { zod, zodClient } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { encodeBase32LowerCase } from '@oslojs/encoding';
import { hash } from '@node-rs/argon2';
import { EmailConfirmFor, UserStatus } from '../../app';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import * as auth from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) throw redirect(302, '/');

	return {
		form: await superValidate(zod(formSchema)),
	};
};

export const actions: Actions = {
	emailIsUnique: async ({ request }) => {
		const formData = await request.formData();

		const email = formData.get('email') as string;

		const user = (await db.select().from(table.user).where(eq(table.user.email, email))).at(0);

		if (!user) {
			return {
				message: 'The email is unique',
			};
		} else {
			return fail(400, {
				message: 'There is an user that uses the email',
			});
		}
	},

	usernameIsUnique: async ({ request }) => {
		const formData = await request.formData();

		const username = formData.get('username') as string;

		const user = (await db.select().from(table.user).where(eq(table.user.username, username))).at(
			0,
		);

		if (!user) {
			return {
				message: 'The username is unique',
			};
		} else {
			return fail(400, {
				message: 'There is an user that uses the username',
			});
		}
	},

	do: async (event) => {
		const form = await superValidate(event.request, zod(formSchema));

		if (!form.valid) {
			return fail(400, { message: 'The form is not valid.', formData: form.data });
		}

		const { email, username, password, agree_marketing } = form.data;

		const userID = generateUserId();

		try {
			await db.insert(table.user).values({
				id: userID,
				username,
				passwordHash: await auth.getPasswordHash(password),
				email,
				status: UserStatus.REQUIRED_EMAIL_CONFIRM,
				preferences: {
					agree_marketing,
				},
			});

			const sessionToken = auth.generateSessionToken();
			const session = await auth.createSession(sessionToken, userID);
			auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
		} catch (e) {
			return fail(500, { message: 'An error has occurred', form });
		}

		return redirect(302, '/register/email-confirm');
	},
};

const generateUserId = () => encodeBase32LowerCase(crypto.getRandomValues(new Uint8Array(15))); // ID with 120 bits of entropy, or about the same as UUID v4.
