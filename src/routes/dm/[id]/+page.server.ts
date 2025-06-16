import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import * as dm from '$lib/server/common/dm';

export const load = (async ({ locals, params }) => {
	if (!locals.user) return {};

	try {
		const info = await dm.getDMChannelInfo(params.id);
		return { info };
	} catch (e) {
		console.error(e);
		throw error(500, { message: 'An error has occurred' });
	}
}) satisfies PageServerLoad;
