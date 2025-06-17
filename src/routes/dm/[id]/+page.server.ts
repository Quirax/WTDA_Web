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
	get: async ({ params, request, locals }) => {
		if (!locals.user) return {};

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

	send: async ({ params, request, locals }) => {
		if (!locals.user) return {};

		const { relatedMessage, ...content } = (await request.json()) as App.GeneralDM;
		const channelId = params.id;

		try {
			const dms = await dm.send(
				channelId,
				locals.user,
				{
					type: 'general',
					...content,
				} as App.DM & App.GeneralDM,
				relatedMessage?.id,
			);

			return { dms };
		} catch (e) {
			console.error(e);
			throw error(500, { message: 'An error has occurred' });
		}
	},
};
