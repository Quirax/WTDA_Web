import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { UserStatus } from '../../../app';
import * as auth from '$lib/server/auth';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) throw redirect(302, '/');
	if (event.locals.user.status === UserStatus.REQUIRED_EMAIL_CONFIRM)
		throw redirect(302, '/register/email-confirm');

	// Invalidate session to lead user to login
	auth.invalidateSession(event.locals.session!.id);
	auth.deleteSessionTokenCookie(event);

	return {
		user: event.locals.user,
	};
};
