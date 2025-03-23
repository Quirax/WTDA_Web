import type { Actions, PageServerLoad } from './$types';
import { sendEmailConfirm } from '$lib/server/mail';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { formSchema } from '$lib/schema/emailConfirm';

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod(formSchema)),
	};
};

export const actions: Actions = {
	send: async ({ request, fetch }) => {
		return {
			message: 'testing',
			result: await sendEmailConfirm({ to: 'quiraxical@gmail.com', confirmCode: 'XXXXX-XXXXX' }),
		};
	},
};
