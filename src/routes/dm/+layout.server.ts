import { error, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { db, table } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import * as dm from '$lib/server/common/dm';

export const load = (async ({ params, locals }) => {
	if (!locals.user) throw redirect(300, '/');

	try {
		return {
			channels: await dm.getDMChannels(locals.user.id),
			id: params.id,
		};
	} catch (e) {
		console.error(e);
		throw error(500, { message: 'An error has occurred' });
	}
}) satisfies LayoutServerLoad;
