import type { Actions, PageServerLoad } from './$types';
import { sendEmailConfirm } from '$lib/server/mail';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { formSchema } from '$lib/schema/emailConfirm';
import { fail, redirect } from '@sveltejs/kit';
import * as mailauth from '$lib/server/mail/auth';
import { EmailConfirmFor, UserStatus } from '../../../app';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) throw redirect(302, '/register');
	if (locals.user.status !== UserStatus.REQUIRED_EMAIL_CONFIRM) throw redirect(302, '/');

	return {
		form: await superValidate(zod(formSchema)),
	};
};

export const actions: Actions = {
	send: async (event) => {
		const confirmCode = mailauth.generateConfirmCode();
		const sessionToken = mailauth.generateSessionToken();

		try {
			const result = await sendEmailConfirm({ to: event.locals.user?.email, confirmCode });

			const session = await mailauth.createSession(
				sessionToken,
				event.locals.user!.id,
				EmailConfirmFor.REGISTRATION,
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

			await db
				.update(table.user)
				.set({ status: UserStatus.NOT_AUTHENTICATED })
				.where(eq(table.user.id, emailConfirm.userId));
		} catch (e: any) {
			return fail(500, { message: 'An error has occurred', error: e, form });
		}

		return redirect(302, '/register/welcome');
	},
};
