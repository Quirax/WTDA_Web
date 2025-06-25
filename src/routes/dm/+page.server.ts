import type { Actions, PageServerLoad } from './$types';
import * as dm from '$lib/server/common/dm';
import { fail } from '@sveltejs/kit';

export const load = (async () => {
	return {};
}) satisfies PageServerLoad;

export const actions: Actions = {
	getUnreadCount: async ({ locals }) => {
		if (!locals.user) return { value: 0 };

		try {
			const value = await dm.getUnreadCount(locals.user);
			return { value };
		} catch (e) {
			console.error(e);
			return fail(500, { message: 'An error has occurred' });
		}
	},
};
