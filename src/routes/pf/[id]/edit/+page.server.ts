import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error, fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { formSchema } from '$lib/schema/request';
import { _registerAttaches } from '../../create/+page.server';

export const load = (async ({ params, locals }) => {
	if (!locals.user) throw redirect(302, '/');

	const id = params.id;

	const article = (
		await db
			.select({
				id: table.commissionRequest.id,
				thumbnail: table.commissionRequest.thumbnail,
				title: table.commissionRequest.title,
				author: {
					id: table.user.id,
					username: table.user.username,
					profileImage: table.user.profileImage,
					email: table.user.email,
					preferences: table.user.preferences,
					profile: table.user.profile,
				},
				category: table.commissionRequest.category,
				tags: table.commissionRequest.tags,
				createDate: table.commissionRequest.createDate,
				modifyDate: table.commissionRequest.modifyDate,
				content: table.commissionRequest.content,
				containsAdultContents: table.commissionRequest.containsAdultContents,
				budget: table.commissionRequest.budget,
				deadline: table.commissionRequest.deadline,
				isForCommercial: table.commissionRequest.isForCommercial,
				purpose: table.commissionRequest.purpose,
				visibleOnlyToCommissioner: table.commissionRequest.visibleOnlyToCommissioner,
			})
			.from(table.commissionRequest)
			.where(eq(table.commissionRequest.id, id))
			.innerJoin(table.user, eq(table.commissionRequest.author, table.user.id))
	).at(0);

	if (!article) throw error(404, { message: 'Cannot find matched request' });

	if (article.author.id !== locals.user.id)
		return fail(403, { message: 'Not authorized to edit the article' });

	return {
		form: await superValidate(zod(formSchema), {
			defaults: article,
		}),
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async (event) => {
		if (!event.locals.user) throw redirect(302, '/');

		const id = event.params.id;

		const form = await superValidate(event.request, zod(formSchema));

		if (!form.valid) {
			return fail(400, { message: 'The form is not valid.', form });
		}

		try {
			await db
				.update(table.commissionRequest)
				.set({
					...form.data,
				})
				.where(eq(table.commissionRequest.id, id));

			await _registerAttaches(id, form.data.content);
		} catch (e: any) {
			console.error(e);
			return fail(500, { message: 'An error has occurred', form });
		}

		return redirect(302, '/r/' + id);
	},
};
