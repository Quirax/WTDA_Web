import { render } from 'svelte/server';
import type { Actions, PageServerLoad } from './$types';
import Template from '$lib/server/mail/template.svelte';
import fs from 'node:fs/promises';

export const actions: Actions = {
	send: async ({ request, fetch }) => {
		const rendered = await render(Template, { props: {} });
		const doctype =
			'<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">';
		const html = `${doctype}${rendered.head}${rendered.body}`;

		return { message: 'testing', html };
	},
};
