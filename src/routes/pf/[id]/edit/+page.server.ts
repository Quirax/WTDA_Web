import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error, fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { formSchema } from '$lib/schema/portfolio';
import { _registerAttaches } from '../../create/+page.server';

export const load = (async ({ params, locals }) => {
	if (!locals.user) throw redirect(302, '/');

	const id = params.id;

	const article = (
		await db
			.select({
				id: table.portfolio.id,
				thumbnail: table.portfolio.thumbnail,
				title: table.portfolio.title,
				author: {
					id: table.user.id,
					username: table.user.username,
					profileImage: table.user.profileImage,
					email: table.user.email,
					preferences: table.user.preferences,
					profile: table.user.profile,
					birthday: table.user.birthday,
					authExpiresAt: table.user.authExpiresAt,
				},
				category: table.portfolio.category,
				tags: table.portfolio.tags,
				createDate: table.portfolio.createDate,
				modifyDate: table.portfolio.modifyDate,
				content: table.portfolio.content,
				containsAdultContents: table.portfolio.containsAdultContents,
				media: table.portfolio.media,
				publishDate: table.portfolio.publishDate,
			})
			.from(table.portfolio)
			.where(eq(table.portfolio.id, id))
			.innerJoin(table.user, eq(table.portfolio.author, table.user.id))
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
				.update(table.portfolio)
				.set({
					...form.data,
					modifyDate: new Date(),
				})
				.where(eq(table.portfolio.id, id));

			await _registerAttaches(id, form.data.content, form.data.media);
		} catch (e: any) {
			console.error(e);
			return fail(500, { message: 'An error has occurred', form });
		}

		return redirect(302, '/pf/' + id);
	},
};
