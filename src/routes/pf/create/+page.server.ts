import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { formSchema } from '$lib/schema/portfolio';
import * as table from '$lib/server/db/schema';
import { db, generateID } from '$lib/server/db';
import { eq } from 'drizzle-orm';

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

		const id = generateID();

		try {
			await db.insert(table.portfolio).values({
				id,
				...form.data,
				author: event.locals.user.id,
			});

			await _registerAttaches(id, form.data.content, form.data.media);
		} catch (e: any) {
			console.error(e);
			return fail(500, { message: 'An error has occurred', form });
		}

		return redirect(302, '/pf/' + id);
	},
};

export const _registerAttaches = async (articleId: string, body: string, attaches: string[]) => {
	// 기존에 등록된 모든 첨부 파일 등록 해제
	await db.delete(table.filesPerPortfolio).where(eq(table.filesPerPortfolio.articleId, articleId));

	// 모든 첨부 파일을 새로 등록
	const inserts = [
		...body.matchAll(/api\/file\/([A-Za-z0-9-\/]+)/g),
		...attaches.flatMap((v) => [...v.matchAll(/api\/file\/([A-Za-z0-9-\/]+)/g)]),
	].map((match) => ({
		articleId,
		path: match[1],
	}));

	if (inserts.length > 0) await db.insert(table.filesPerPortfolio).values(inserts);
};
