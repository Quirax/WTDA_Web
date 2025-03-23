import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { UserStatus } from '../../../app';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) throw redirect(302, '/');
	if (locals.user.status === UserStatus.REQUIRED_EMAIL_CONFIRM)
		throw redirect(302, '/register/email-confirm');

	return {
		user: locals.user,
	};
};
