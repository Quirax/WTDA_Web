import type { Actions, PageServerLoad } from './$types';
import { sendEmailConfirm } from '$lib/server/mail';

export const actions: Actions = {
	send: async ({ request, fetch }) => {
		return {
			message: 'testing',
			result: await sendEmailConfirm({ to: 'quiraxical@gmail.com', confirmCode: 'XXXXX-XXXXX' }),
		};
	},
};
