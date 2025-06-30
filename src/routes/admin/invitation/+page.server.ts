import { db, table } from '$lib/server/db';
import { desc, eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { alias } from 'drizzle-orm/pg-core';
import { fail } from '@sveltejs/kit';
import { invitationCodesPerPage } from '$lib/config';

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
};

export type InvitationCode = {
	code: string;
	createdBy: NonNullable<App.User>;
	usedBy: App.User;
	createdDate: Date;
};
