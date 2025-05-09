import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { userSchema } from '$lib/schema/userInfo';
import { _getPreferences, _userInfoEditCookie } from '../+page.server';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { getPasswordHash } from '$lib/server/auth';
import * as auth from '$lib/server/auth';
import { UserStatus } from '@app';

export const load = (async (event) => {
	if (!event.locals.user) throw redirect(302, '/');

	const userInfoEditToken = event.cookies.get(_userInfoEditCookie);

	if (!userInfoEditToken) throw redirect(302, '/settings/info');

	event.cookies.delete(_userInfoEditCookie, {
		path: '/',
	});

	const preferences = await _getPreferences(event.locals.user.id);

	return {
		form: await superValidate(zod(userSchema), {
			defaults: preferences.form,
		}),
		auth: preferences.auth,
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	do: async (event) => {
		if (!event.locals.user) throw redirect(302, '/');

		const form = await superValidate(event.request, zod(userSchema));

		if (!form.valid) {
			return fail(400, { message: 'The form is not valid.', form });
		}

		const { password, agree_marketing, display_adult_contents, display_grotesque_contents } =
			form.data;

		let set: Partial<{
			preferences: App.Preferences;
		}> &
			Partial<{ passwordHash: string }> = {
			preferences: {
				agree_marketing,
				display_adult_contents,
				display_grotesque_contents,
			},
		};

		if (password) set = { ...set, passwordHash: await getPasswordHash(password) };

		try {
			await db.update(table.user).set(set).where(eq(table.user.id, event.locals.user.id));
		} catch (e: any) {
			console.error(e);
			return fail(500, { message: 'An error has occurred', form });
		}

		return redirect(302, '/settings/info');
	},

	deactivate: async (event) => {
		if (!event.locals.user) throw redirect(302, '/');
		if (!event.locals.session) throw redirect(302, '/');

		try {
			// TODO: Disable all commission request and request suggestion

			// TODO: Cancel all commission and refund

			// TODO: Settle up all remain gains

			// TODO: Belong all remain points to WTDA

			await db
				.update(table.user)
				.set({
					status: UserStatus.DEACTIVATED, // Deactivate
					profileImage: null, // Remove profile image
					username: `DELETED(${event.locals.user.id})`, // Change username
				})
				.where(eq(table.user.id, event.locals.user.id));

			// Invalidate session
			await auth.invalidateSession(event.locals.session.id);
			auth.deleteSessionTokenCookie(event);

			event.locals.user = null;
			event.locals.session = null;
		} catch (e: any) {
			console.error(e);
			return fail(500, { message: 'An error has occurred' });
		}

		return { message: 'Deletion of account completed' };
	},
};
