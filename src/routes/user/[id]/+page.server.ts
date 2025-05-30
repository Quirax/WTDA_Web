import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db, generateID } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { and, desc, eq, sql } from 'drizzle-orm';
import { announcementsPerPage, profileArticlesPerPage } from '$lib/config';
import { announcementSchema, profileSchema } from '../../../lib/schema/profile';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { sanitizeHTML } from '$lib/utils';
import * as auth from '$lib/server/auth.js';
import { encodeBase32LowerCase } from '@oslojs/encoding';
import { ArticleType, UserRelationship } from '@app';
import { allArticles } from '$lib/server/db/shorthands';

export const load = (async ({ params, locals }) => {
	const id = params.id;

	// 내 프로필로 접근하려는 경우
	if (id === '@me') {
		if (locals.user) throw redirect(302, '/user/' + locals.user.id);
		else throw redirect(302, '/login');
	}

	try {
		const user = (
			await db
				.select({
					username: table.user.username,
					profileImage: table.user.profileImage,
					email: table.user.email,
					preferences: table.user.preferences,
					profile: table.user.profile,
					id: table.user.id,
					birthday: table.user.birthday,
					authExpiresAt: table.user.authExpiresAt,
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

		let relationship = UserRelationship.NONE;

		if (locals.user) {
			const result = (
				await db
					.select({ relationship: table.userRelationship.relationship })
					.from(table.userRelationship)
					.where(
						and(eq(table.userRelationship.from, locals.user.id), eq(table.userRelationship.to, id)),
					)
			).at(0);

			if (result) relationship = result.relationship;
		}

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
			relationship,
		};
	} catch (e) {
		console.error(e);
		throw error(500, { message: 'An error has occurred' });
	}
}) satisfies PageServerLoad;

export const actions: Actions = {
	update: async (event) => {
		// if (!event.locals.user || event.locals.user.id !== event.params.id) return fail(403, { message: 'Unauthorized access' });

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

			// 포함된 이미지 등록
			await _registerAttaches(event.locals.user.id, introduction || '', profileImage, headerImage);
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

	articles: async ({ params, request, locals }) => {
		const id = params.id;

		const formData = await request.formData();
		const tab = formData.get('tab') as string;
		const page = parseInt(formData.get('page') as string);

		let types: ArticleType[] = [];

		switch (tab) {
			case 'all':
				types = [ArticleType.REQUEST, ArticleType.COMMISSION, ArticleType.PORTFOLIO];
				break;
			case 'requests':
				types = [ArticleType.REQUEST];
				break;
			case 'portfolio':
				types = [ArticleType.PORTFOLIO];
				break;
		}

		let results = [];
		let count = 0;

		try {
			const articleQuery = allArticles(
				types,
				{
					request: eq(table.commissionRequest.author, id),
					commission: eq(table.commissionRequest.author, id),
					portfolio: eq(table.portfolio.author, id),
				},
				locals.user,
			);

			if (articleQuery) count = await db.$count(articleQuery);

			results =
				(await articleQuery
					?.limit(profileArticlesPerPage)
					.offset(profileArticlesPerPage * (page - 1))) || [];
		} catch (e) {
			console.error(e);
			return fail(500, { message: 'An error has occurred' });
		}

		return { message: 'Got articles List', list: results, count };
	},

	block: async ({ locals, params }) => {
		if (!locals.user) return fail(403, { message: 'Not logined' });

		const fromUser = locals.user.id;
		const toUser = params.id;

		try {
			await db
				.insert(table.userRelationship)
				.values({
					from: fromUser,
					to: toUser,
					relationship: UserRelationship.BLOCKED,
				})
				// ref: https://orm.drizzle.team/docs/guides/upsert
				.onConflictDoUpdate({
					target: [table.userRelationship.from, table.userRelationship.to],
					set: { relationship: UserRelationship.BLOCKED },
				});
		} catch (e) {
			console.error(e);
			return fail(500, { message: 'An error has occurred' });
		}

		return { message: 'Blocked the user' };
	},
};

const _registerAttaches = async (
	userId: string,
	body: string,
	profileImage?: string | null,
	headerImage?: string | null,
) => {
	// 기존에 등록된 모든 첨부 파일 등록 해제
	await db.delete(table.filesPerProfile).where(eq(table.filesPerProfile.userId, userId));

	// 모든 첨부 파일을 새로 등록
	const inserts = [
		...body.matchAll(/api\/file\/([A-Za-z0-9-\/]+)/g),
		...(profileImage?.matchAll(/api\/file\/([A-Za-z0-9-\/]+)/g) ?? []),
		...(headerImage?.matchAll(/api\/file\/([A-Za-z0-9-\/]+)/g) ?? []),
	].map((match) => ({
		userId,
		path: match[1],
	}));

	if (inserts.length > 0) await db.insert(table.filesPerProfile).values(inserts);
};
