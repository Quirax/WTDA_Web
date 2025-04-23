import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { formSchema } from '$lib/schema/request';
import * as table from '$lib/server/db/schema';
import { db, generateID } from '$lib/server/db';

export const load = (async ({ locals }) => {
	if (!locals.user) throw redirect(302, '/');

	return {
		form: await superValidate(zod(formSchema)),
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async (event) => {
		if (!event.locals.user) throw redirect(302, '/');

		const form = await superValidate(event.request, zod(formSchema));

		if (!form.valid) {
			return fail(400, { message: 'The form is not valid.', form });
		}

		try {
			await db.insert(table.commissionRequest).values({
				id: generateID(),
				...form.data,
				author: event.locals.user.id,
			});
		} catch (e: any) {
			console.error(e);
			return fail(500, { message: 'An error has occurred', form });
		}

		return { message: 'Created successfully', form };
	},
};
