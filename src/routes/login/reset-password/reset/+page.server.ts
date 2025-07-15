import { fail, superValidate } from 'sveltekit-superforms';
import type { PageServerLoad, Actions } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { passwordSchema } from '$lib/schema/login';
import * as mailauth from '$lib/server/mail/auth';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { encodeHexLowerCase } from '@oslojs/encoding';
import { sha256 } from '@oslojs/crypto/sha2';
import { getPasswordHash } from '$lib/server/auth';
import { sendPasswordChangedNotification } from '$lib/server/mail';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ cookies }) => {
	const sessionToken = cookies.get(mailauth.sessionCookieName);
	if (!sessionToken) throw redirect(301, '/');

	return {
		form: await superValidate(zod(passwordSchema)),
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event.request, zod(passwordSchema));

		if (!form.valid) {
			return fail(400, { message: 'The form is not valid.', form });
		}

		const { password } = form.data;

		const sessionToken = event.cookies.get(mailauth.sessionCookieName);
		if (!sessionToken) {
			return fail(404, { message: 'Mail confirmation session has been invalidated', form });
		}

		try {
			const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(sessionToken)));

			const [result] = await db
				.select({
					user: {
						email: table.user.email,
					},
					emailConfirm: table.emailConfirm,
				})
				.from(table.emailConfirm)
				.innerJoin(table.user, eq(table.emailConfirm.userId, table.user.id))
				.where(eq(table.emailConfirm.id, sessionId));

			if (!result) return fail(404, { message: 'Not found email confirmation session', form });

			const { emailConfirm, user } = result;

			if (!emailConfirm || !user)
				return fail(404, { message: 'Not found email confirmation with the code', form });

			await db
				.update(table.user)
				.set({ passwordHash: await getPasswordHash(password) })
				.where(eq(table.user.id, emailConfirm.userId));

			await mailauth.invalidateSession(emailConfirm.id);
			mailauth.deleteSessionTokenCookie(event);

			await sendPasswordChangedNotification({ to: user.email });
		} catch (e: any) {
			return fail(500, { message: 'An error has occurred', form });
		}

		return {
			message: 'Password is changed successfully',
			form,
		};
	},
};
