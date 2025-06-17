import { error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
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

export const actions: Actions = {
	get: async ({ params, request }) => {
		const before = new Date((await request.formData()).get('before') as string);
		const channelId = params.id;

		try {
			const dms = await dm.get(channelId, before);
			return { dms };
		} catch (e) {
			console.error(e);
			throw error(500, { message: 'An error has occurred' });
		}
	},
};
