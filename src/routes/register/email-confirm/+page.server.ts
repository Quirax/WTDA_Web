import type { Actions, PageServerLoad } from './$types';
import { sendEmailConfirm } from '$lib/server/mail';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { formSchema } from '$lib/schema/emailConfirm';
import { fail } from '@sveltejs/kit';
import * as mailauth from '$lib/server/mail/auth';
import { EmailConfirmFor } from '../../../app';

export const load: PageServerLoad = async () => {
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
		} catch (e: any) {
			return fail(500, { message: 'An error has occurred', error: e, form });
		}

		return {
			message: 'completed',
			form,
		};
	},
};
