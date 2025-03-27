import type { Actions, PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, ne } from 'drizzle-orm';
import * as mailauth from '$lib/server/mail/auth';
import { formSchema } from '$lib/schema/emailConfirm';
import { sendEmailConfirm } from '$lib/server/mail';
import { EmailConfirmFor, UserStatus } from '@app';
import { and } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) throw redirect(302, '/');

	return {
		form: await superValidate(zod(formSchema)),
	};
};

export const actions: Actions = {
	send: async (event) => {
		const formData = await event.request.formData();

		const email = formData.get('email') as string;

		try {
			const results = await db
				.select()
				.from(table.user)
				.where(and(eq(table.user.email, email), ne(table.user.status, UserStatus.DEACTIVATED))); // Prevent deactivated user to be login

			const existingUser = results.at(0);
			if (!existingUser) {
				return fail(404, { message: 'Not found matched user' });
			}

			const confirmCode = mailauth.generateConfirmCode();
			const sessionToken = mailauth.generateSessionToken();

			const result = await sendEmailConfirm({ to: email, confirmCode });

			const session = await mailauth.createSession(
				sessionToken,
				existingUser.id,
				EmailConfirmFor.RESET_PASSWORD,
				confirmCode,
			);

			mailauth.setSessionTokenCookie(event, sessionToken, session.expiresAt);

			return {
				message: 'Email sent',
				result,
			};
		} catch (e: any) {
			return fail(500, { message: 'An error has occurred', error: e });
		}
	},

	do: async (event) => {
		const form = await superValidate(event.request, zod(formSchema));

		if (!form.valid) {
			return fail(400, { message: 'The form is not valid.', form });
		}

		const sessionToken = event.cookies.get(mailauth.sessionCookieName);
		if (!sessionToken) {
			return fail(404, { message: 'Mail confirmation session has been invalidated', form });
		}

		try {
			const { emailConfirm } = await mailauth.validateSessionToken(
				sessionToken,
				form.data.confirmCode,
			);

			if (!emailConfirm)
				return fail(404, { message: 'Not found email confirmation with the code', form });
		} catch (e: any) {
			return fail(500, { message: 'An error has occurred', error: e, form });
		}

		return redirect(302, '/login/reset-password/reset');
	},
};
