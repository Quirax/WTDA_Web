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

// XXX (여기부터) 알파테스트 전용
const checkInvitationCode = async (invitationCode: string | null) => {
	if (!invitationCode) throw new Error('Invitation code is required', { cause: 400 });

	const invitationCodeRecord = (
		await db
			.select()
			.from(table.invitationCode)
			.where(eq(table.invitationCode.code, invitationCode))
	).at(0);

	if (!invitationCodeRecord) throw new Error('Invalid invitation code', { cause: 404 });

	const invitationCodeUser = (
		await db
			.select({ invitationCode: table.user.invitationCode })
			.from(table.user)
			.where(eq(table.user.invitationCode, invitationCode))
	).at(0);

	if (invitationCodeUser) throw new Error('Invalid invitation code', { cause: 404 });
};
// XXX (여기까지) 알파테스트 전용

export const actions: Actions = {
	send: async (event) => {
		// XXX (여기부터) 알파테스트 전용
		const invitationCode = (await event.request.formData()).get('invitation_code') as string | null;

		try {
			await checkInvitationCode(invitationCode);
		} catch (e) {
			if (e instanceof Error && typeof e.cause === 'number')
				return fail(e.cause, { message: e.message });
		}
		// XXX (여기까지) 알파테스트 전용

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

			// XXX (여기부터) 알파테스트 전용
			event.cookies.set('email-confirm-invitation-code', invitationCode!, {
				expires: session.expiresAt,
				path: '/',
			});
			// XXX (여기까지) 알파테스트 전용

			return {
				message: 'Email sent',
				result,
			};
		} catch (e: any) {
			console.error(e);
			return fail(500, { message: 'An error has occurred' });
		}
	},

	do: async (event) => {
		const form = await superValidate(event.request, zod(formSchema));

		if (!form.valid) {
			return fail(400, { message: 'The form is not valid.', form });
		}

		// XXX (여기부터) 알파테스트 전용
		const invitationCode = event.cookies.get('email-confirm-invitation-code') || null;

		try {
			await checkInvitationCode(invitationCode);
		} catch (e) {
			if (e instanceof Error && typeof e.cause === 'number')
				return fail(e.cause, { message: e.message });
		}
		// XXX (여기까지) 알파테스트 전용

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
				.set({
					status: UserStatus.NOT_AUTHENTICATED,
					invitationCode: invitationCode, // XXX 알파테스트 전용
				})
				.where(eq(table.user.id, emailConfirm.userId));
		} catch (e: any) {
			console.error(e);
			return fail(500, { message: 'An error has occurred', form });
		}

		return redirect(302, '/register/welcome');
	},
};
