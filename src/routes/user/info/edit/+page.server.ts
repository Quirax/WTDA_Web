import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { _userInfoEditCookie } from '../+page.server';

export const load = (async (event) => {
	if (!event.locals.user) throw redirect(302, '/');

	const userInfoEditToken = event.cookies.get(_userInfoEditCookie);

	if (!userInfoEditToken) throw redirect(302, '/user/info');

	event.cookies.delete(_userInfoEditCookie, {
		path: '/',
	});

	return {};
}) satisfies PageServerLoad;
