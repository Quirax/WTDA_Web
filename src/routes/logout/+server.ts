import { error, redirect } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async (event) => {
	if (!event.locals.session) {
		return error(401);
	}

	await auth.invalidateSession(event.locals.session.id);
	auth.deleteSessionTokenCookie(event);

	return redirect(302, '/');
};
