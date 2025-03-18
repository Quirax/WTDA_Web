import type { Actions, PageServerLoad } from './$types';
import { superForm, superValidate } from 'sveltekit-superforms';
import { formSchema } from '$lib/schema/register';
import { zod, zodClient } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod(formSchema)),
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod(formSchema));

		if (!form.valid) {
			return fail(400, { message: 'The form is not valid.', formData: form.data });
		}

		console.log(form.data);
		// const formData = await event.request.formData();
		// const username = formData.get('username');
		// const password = formData.get('password');
		// if (!validateUsername(username)) {
		// 	return fail(400, { message: 'Invalid username' });
		// }
		// if (!validatePassword(password)) {
		// 	return fail(400, { message: 'Invalid password' });
		// }
		// const userId = generateUserId();
		// const passwordHash = await hash(password, {
		// 	// recommended minimum parameters
		// 	memoryCost: 19456,
		// 	timeCost: 2,
		// 	outputLen: 32,
		// 	parallelism: 1,
		// });
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

// function generateUserId() {
// 	// ID with 120 bits of entropy, or about the same as UUID v4.
// 	const bytes = crypto.getRandomValues(new Uint8Array(15));
// 	const id = encodeBase32LowerCase(bytes);
// 	return id;
// }

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
