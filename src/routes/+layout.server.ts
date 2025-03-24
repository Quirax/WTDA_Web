import { redirect } from '@sveltejs/kit';
import { UserStatus } from '../app';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (locals.user?.status === UserStatus.REQUIRED_EMAIL_CONFIRM)
		throw redirect(302, '/register/email-confirm');

	return {
		user: locals.user,
		session: locals.session,
	};
};
