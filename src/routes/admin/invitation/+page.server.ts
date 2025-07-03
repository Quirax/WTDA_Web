import { db, generateID, table } from '$lib/server/db';
import { desc, eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { alias } from 'drizzle-orm/pg-core';
import { fail } from '@sveltejs/kit';
import { invitationCodeLength, invitationCodesPerPage } from '$lib/config';
import { UserRole } from '@app';

export const load = (async () => {
	return {};
}) satisfies PageServerLoad;

export const actions: Actions = {
	invitationCodes: async ({ request }) => {
		const page = parseInt(((await request.formData()).get('page') as string | null) || '1');

		try {
			const total = await db.$count(table.invitationCode);

			const createdBy = alias(table.user, 'created_by');
			const usedBy = alias(table.user, 'used_by');

			const invitationCodes = await db
				.select({
					code: table.invitationCode.code,
					createdBy,
					usedBy,
					createdDate: table.invitationCode.createdDate,
				})
				.from(table.invitationCode)
				.orderBy(desc(table.invitationCode.createdDate))
				.innerJoin(createdBy, eq(table.invitationCode.createdBy, createdBy.id))
				.leftJoin(usedBy, eq(table.invitationCode.code, usedBy.invitationCode))
				.limit(invitationCodesPerPage)
				.offset(invitationCodesPerPage * (page - 1));

			return { message: 'Got invitation codes', list: invitationCodes, total };
		} catch (e) {
			console.error(e);
			return fail(500, { message: 'An error has occurred' });
		}
	},

	create: async ({ locals }) => {
		if (!locals.user || locals.user.role !== UserRole.ADMIN)
			return fail(403, { message: 'You are not allowed' });

		try {
			await db.insert(table.invitationCode).values({
				code: generateID(invitationCodeLength),
				createdBy: locals.user.id,
			});

			return { message: 'Created an invitaion code' };
		} catch (e) {
			console.error(e);
			return fail(500, { message: 'An error has occurred' });
		}
	},

	delete: async ({ locals, request }) => {
		if (!locals.user || locals.user.role !== UserRole.ADMIN)
			return fail(403, { message: 'You are not allowed' });

		const target = (await request.formData()).get('target') as string;

		try {
			if (
				(
					await db
						.select({ id: table.user.id })
						.from(table.user)
						.where(eq(table.user.invitationCode, target))
				).length > 0
			) {
				return fail(405, { message: 'Cannot delete the used invitation code' });
			}

			await db.delete(table.invitationCode).where(eq(table.invitationCode.code, target));

			return { message: 'Deleted the invitaion code' };
		} catch (e) {
			console.error(e);
			return fail(500, { message: 'An error has occurred' });
		}
	},
};

export type InvitationCode = {
	code: string;
	createdBy: NonNullable<App.User>;
	usedBy: App.User;
	createdDate: Date;
};
