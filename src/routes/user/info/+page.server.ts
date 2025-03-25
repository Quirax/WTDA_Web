import { superValidate } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { userSchema } from '$lib/schema/register';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ locals }) => {
	if (!locals.user) throw redirect(302, '/');

	return {
		form: await superValidate(zod(userSchema)),
	};
}) satisfies PageServerLoad;
