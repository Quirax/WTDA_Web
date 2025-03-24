import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { formSchema } from '$lib/schema/login';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) throw redirect(302, '/');

	return {
		form: await superValidate(zod(formSchema)),
	};
};

export const actions: Actions = {
	default: async (event) => {
		return fail(404, { message: 'Not found matched user' });
	},
};
