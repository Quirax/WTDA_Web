import { redirect } from '@sveltejs/kit';
import { UserStatus } from '../app';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, route }) => {
	if (
		locals.user?.status === UserStatus.REQUIRED_EMAIL_CONFIRM &&
		route.id !== '/register/email-confirm'
	)
		throw redirect(302, '/register/email-confirm');

	return {
		user: locals.user,
		session: locals.session,
	};
};
