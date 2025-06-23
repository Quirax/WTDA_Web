import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import * as dm from '$lib/server/common/dm';
import type { Emoji } from 'emoji-type';
import { db } from '$lib/server/db';

export const load = (async ({ locals, params }) => {
	if (!locals.user) return {};

	try {
		const info = await dm.getDMChannelInfo(params.id, locals.user);
		return { info };
	} catch (e) {
		if (e instanceof Error && typeof e.cause === 'number') {
			if (e.cause === 403) throw redirect(308, '/dm');
		}

		console.error(e);
		throw error(500, { message: 'An error has occurred' });
	}
}) satisfies PageServerLoad;

export const actions: Actions = {
	get: async ({ params, request, locals }) => {
		if (!locals.user) return {};

		const before = new Date(parseInt((await request.formData()).get('before') as string));
		const channelId = params.id;

		try {
			const dms = await dm.get(channelId, before, locals.user);
			return { dms };
		} catch (e) {
			console.error(e);
			return fail(500, { message: 'An error has occurred' });
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
			if (e instanceof Error && typeof e.cause === 'number') {
				return fail(e.cause, { message: e.message });
			}

			console.error(e);
			return fail(500, { message: 'An error has occurred' });
		}
	},

	react: async ({ params, request, locals }) => {
		if (!locals.user) return {};

		const body = await request.formData();

		const emoji = body.get('emoji') as Emoji | null;
		const messageId = body.get('messageId') as string;
		const channelId = params.id;

		try {
			await dm.react(channelId, messageId, locals.user, emoji);

			return { message: 'React completed' };
		} catch (e) {
			console.error(e);
			return fail(500, { message: 'An error has occurred' });
		}
	},

	leave: async ({ params, locals }) => {
		if (!locals.user) return {};

		const channelId = params.id;

		try {
			await dm.leaveFromChannel(db, locals.user, channelId);
			return { message: 'Leave completed' };
		} catch (e) {
			console.error(e);
			return fail(500, { message: 'An error has occurred' });
		}
	},
};
