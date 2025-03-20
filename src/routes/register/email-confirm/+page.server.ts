import type { Actions, PageServerLoad } from './$types';
import { renderMail } from '$lib/server/mail';

import EmailConfirm from '$lib/server/mail/emailConfirm.svelte';

export const actions: Actions = {
	send: async ({ request, fetch }) => {
		return {
			message: 'testing',
			html: await renderMail(EmailConfirm, { confirmCode: 'XXXXX-XXXXX' }),
		};
	},
};
