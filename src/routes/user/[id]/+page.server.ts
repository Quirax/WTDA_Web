import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db, generateID } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { and, desc, eq, sql } from 'drizzle-orm';
import { announcementsPerPage } from '$lib/config';
import { announcementSchema, profileSchema } from '../../../lib/schema/profile';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { sanitizeHTML } from '$lib/utils';
import * as auth from '$lib/server/auth.js';
import { encodeBase32LowerCase } from '@oslojs/encoding';
import { ArticleType } from '@app';

export const load = (async ({ params, locals }) => {
	const id = params.id;

	// 내 프로필로 접근하려는 경우
	if (id === '@me') {
		if (locals.user) throw redirect(302, '/user/' + locals.user.id);
		else throw redirect(302, '/login');
	}

	const user = (
		await db
			.select({
				username: table.user.username,
				profileImage: table.user.profileImage,
				email: table.user.email,
				preferences: table.user.preferences,
				profile: table.user.profile,
				id: table.user.id,
			})
			.from(table.user)
			.where(eq(table.user.id, id))
	).at(0);

	if (!user) throw error(404, { message: 'Cannot find matched user' });

	const profileAnnouncements = (
		await db
			.select()
			.from(table.profileAnnouncements)
			.where(eq(table.profileAnnouncements.userId, id))
			// ref: https://stackoverflow.com/a/79132920
			.orderBy(desc(table.profileAnnouncements.createDate))
			// ref: https://orm.drizzle.team/docs/select#limit--offset
			.limit(1)
	).at(0);

	return {
		user,
		profileAnnouncements,
		profileForm: await superValidate(zod(profileSchema), {
			defaults: {
				username: user.username,
				profileImage: user.profileImage,
				headerImage: user.profile.headerImage,
				introduction: user.profile.introduction,
				contactAvailable: user.profile.contactAvailable || null,
				links: user.profile.links,
				accentColor: user.profile.accentColor,
			},
		}),
		announcementForm: await superValidate(zod(announcementSchema)),
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	update: async (event) => {
		if (!event.locals.user) throw redirect(302, '/');

		const form = await superValidate(event.request, zod(profileSchema));

		if (!form.valid) {
			return fail(400, { message: 'The form is not valid.', form });
		}

		const {
			username,
			profileImage,
			headerImage,
			introduction,
			contactAvailable,
			links,
			accentColor,
		} = form.data;

		let set: Partial<{
			username: typeof username;
			profileImage: typeof profileImage;
			profile: Partial<App.Profile>;
		}> = {
			username,
			profileImage,
			profile: {
				headerImage: headerImage === null ? undefined : headerImage,
				introduction: sanitizeHTML(introduction || ''),
				contactAvailable: contactAvailable === null ? undefined : contactAvailable,
				links: links === null ? undefined : links,
				accentColor,
			},
		};

		try {
			await db.update(table.user).set(set).where(eq(table.user.id, event.locals.user.id));
		} catch (e: any) {
			console.error(e);
			return fail(500, { message: 'An error has occurred', form });
		}

		// Get updated result
		const sessionToken = event.cookies.get(auth.sessionCookieName) || '';
		const { user } = await auth.validateSessionToken(sessionToken);

		return { message: 'Updated successfully', form, user };
	},

	announcementsList: async ({ params, request }) => {
		const id = params.id;
		const page = parseInt(((await request.formData()).get('page') as string | null) || '1');

		try {
			const total = await db.$count(
				table.profileAnnouncements,
				eq(table.profileAnnouncements.userId, id),
			);

			const announcements = await db
				.select({
					id: table.profileAnnouncements.id,
					title: table.profileAnnouncements.title,
					createDate: table.profileAnnouncements.createDate,
				})
				.from(table.profileAnnouncements)
				.where(eq(table.profileAnnouncements.userId, id))
				// ref: https://stackoverflow.com/a/79132920
				.orderBy(desc(table.profileAnnouncements.createDate))
				// ref: https://orm.drizzle.team/docs/select#limit--offset
				.limit(announcementsPerPage)
				.offset(announcementsPerPage * (page - 1));

			return { message: 'Got announcements List', list: announcements, total };
		} catch (e) {
			console.error(e);
			return fail(500, { message: 'An error has occurred' });
		}
	},

	announcement: async ({ request }) => {
		const id = (await request.formData()).get('id') as string | null;

		if (!id) return fail(400, { message: 'No announcement id is specified' });

		try {
			const announcement = (
				await db
					.select({
						content: table.profileAnnouncements.content,
						title: table.profileAnnouncements.title,
						createDate: table.profileAnnouncements.createDate,
					})
					.from(table.profileAnnouncements)
					.where(eq(table.profileAnnouncements.id, id))
			).at(0);

			return { message: 'Got announcements List', announcement };
		} catch (e) {
			console.error(e);
			return fail(500, { message: 'An error has occurred' });
		}
	},

	saveAnnouncement: async (event) => {
		if (!event.locals.user) return fail(403, { message: 'Access denied' });

		const form = await superValidate(event.request, zod(announcementSchema));

		if (!form.valid) {
			return fail(400, { message: 'The form is not valid.', form });
		}

		const { title, content } = form.data;

		try {
			await db.insert(table.profileAnnouncements).values({
				title,
				content,
				userId: event.locals.user.id,
				id: generateID(),
			});

			return { message: 'Saved the announcement' };
		} catch (e) {
			console.error(e);
			return fail(500, { message: 'An error has occurred' });
		}
	},

	deleteAnnouncement: async ({ request, locals }) => {
		if (!locals.user) return fail(403, { message: 'Access denied' });

		const id = (await request.formData()).get('id') as string | null;

		if (!id) return fail(400, { message: 'No announcement id is specified' });

		try {
			await db
				.delete(table.profileAnnouncements)
				.where(
					and(
						eq(table.profileAnnouncements.id, id),
						eq(table.profileAnnouncements.userId, locals.user.id),
					),
				);

			return { message: 'Deleted the announcement' };
		} catch (e) {
			console.error(e);
			return fail(500, { message: 'An error has occurred' });
		}
	},

	articles: async ({ params, request }) => {
		const id = params.id;

		const formData = await request.formData();
		const tab = formData.get('tab') as string;

		let results: (App.Articles & { modifyDate: Date })[] = [];

		if (tab === 'all' || tab === 'requests') {
			try {
				const articles = await db
					.select({
						id: table.commissionRequest.id,
						type: sql<'request'>`'REQUEST'`,
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
						modifyDate: table.commissionRequest.modifyDate,
					})
					.from(table.commissionRequest)
					.where(eq(table.commissionRequest.author, id))
					.innerJoin(table.user, eq(table.commissionRequest.author, table.user.id))
					.limit(10);

				results = [...results, ...articles];
			} catch (e) {
				console.error(e);
				return fail(500, { message: 'An error has occurred' });
			}
		}

		results = results
			.sort((a, b) => b.modifyDate.getTime() - a.modifyDate.getTime())
			.slice(undefined, 10);

		return { message: 'Got articles List', list: results };
	},
};
