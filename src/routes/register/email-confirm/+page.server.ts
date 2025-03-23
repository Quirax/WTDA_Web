import type { Actions, PageServerLoad } from './$types';
import { sendEmailConfirm } from '$lib/server/mail';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { formSchema } from '$lib/schema/emailConfirm';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod(formSchema), {
			defaults: { email: 'quiraxical@gmail.com', confirmCode: '' },
		}),
	};
};

export const actions: Actions = {
	send: async ({ request, fetch }) => {
		return {
			message: 'testing',
			// result: await sendEmailConfirm({ to: 'quiraxical@gmail.com', confirmCode: 'XXXXX-XXXXX' }),
		};
	},

	do: async ({ request }) => {
		const form = await superValidate(request, zod(formSchema));

		if (!form.valid) {
			return fail(400, { message: 'The form is not valid.', formData: form.data });
		}

		return {
			message: 'completed',
			form,
		};
	},
};
