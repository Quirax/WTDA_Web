import { error, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import * as dm from '$lib/server/common/dm';

export const load = (async ({ locals }) => {
	if (!locals.user) throw redirect(300, '/');

	try {
		return {
			channels: await dm.getDMChannels(locals.user.id),
		};
	} catch (e) {
		console.error(e);
		throw error(500, { message: 'An error has occurred' });
	}
}) satisfies LayoutServerLoad;
