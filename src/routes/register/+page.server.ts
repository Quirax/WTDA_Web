import type { Actions, PageServerLoad } from './$types';
import { superForm, superValidate } from 'sveltekit-superforms';
import { formSchema } from '$lib/schema/register';
import { zod, zodClient } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import { encodeBase32LowerCase } from '@oslojs/encoding';
import { hash } from '@node-rs/argon2';
import { UserStatus } from '../../app';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
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

	do: async ({ request }) => {
		const form = await superValidate(request, zod(formSchema));

		if (!form.valid) {
			return fail(400, { message: 'The form is not valid.', formData: form.data });
		}

		const { email, username, password, agree_marketing } = form.data;

		const userID = generateUserId();
		const passwordHash = await hash(password, {
			// recommended minimum parameters
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1,
		});

		console.log({
			id: userID,
			username,
			passwordHash,
			fallbackInitial: 'TODO',
			email,
			status: UserStatus.REQUIRED_EMAIL_CONFIRM,
			preferences: {
				agree_marketing,
			},
		});
		// try {
		// 	await db.insert(table.user).values({ id: userId, username, passwordHash });
		// 	const sessionToken = auth.generateSessionToken();
		// 	const session = await auth.createSession(sessionToken, userId);
		// 	auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
		// } catch (e) {
		// 	return fail(500, { message: 'An error has occurred' });
		// }
		// return redirect(302, '/demo/lucia');
	},
};

const generateUserId = () => encodeBase32LowerCase(crypto.getRandomValues(new Uint8Array(15))); // ID with 120 bits of entropy, or about the same as UUID v4.

// function validateUsername(username: unknown): username is string {
// 	return (
// 		typeof username === 'string' &&
// 		username.length >= 3 &&
// 		username.length <= 31 &&
// 		/^[a-z0-9_-]+$/.test(username)
// 	);
// }

// function validatePassword(password: unknown): password is string {
// 	return typeof password === 'string' && password.length >= 6 && password.length <= 255;
// }
