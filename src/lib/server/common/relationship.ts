import { UserRelationship } from '@app';
import { db, table } from '../db';
import { and, eq } from 'drizzle-orm';
import { notify } from './telecom';

export const blockUser = async (fromUser: string, toUser: string) => {
	if (fromUser === toUser) throw new Error('Cannot block yourself', { cause: 400 });

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

	notify(toUser, {
		event: 'relationshipChanged',
		fromUser,
		relationship: UserRelationship.BLOCKED,
	});

	notify(fromUser, {
		event: 'relationshipChanged',
		toUser,
		relationship: UserRelationship.BLOCKED,
	});
};

export const unblockUser = async (fromUser: string, toUser: string) => {
	if (fromUser === toUser) throw new Error('Cannot unblock yourself', { cause: 400 });

	await db
		.delete(table.userRelationship)
		.where(and(eq(table.userRelationship.from, fromUser), eq(table.userRelationship.to, toUser)));

	notify(toUser, { event: 'relationshipChanged', fromUser, relationship: UserRelationship.NONE });

	notify(fromUser, {
		event: 'relationshipChanged',
		toUser,
		relationship: UserRelationship.NONE,
	});
};

export const getRelationship = async (fromUser: string, toUser: string) => {
	if (fromUser === toUser) throw new Error('Cannot block yourself', { cause: 400 });

	let relationshipFromUser = UserRelationship.NONE;
	let relationshipToUser = UserRelationship.NONE;

	{
		const result = (
			await db
				.select({ relationship: table.userRelationship.relationship })
				.from(table.userRelationship)
				.where(
					and(eq(table.userRelationship.from, fromUser), eq(table.userRelationship.to, toUser)),
				)
		).at(0);

		if (result) relationshipToUser = result.relationship;
	}
	{
		const result = (
			await db
				.select({ relationship: table.userRelationship.relationship })
				.from(table.userRelationship)
				.where(
					and(eq(table.userRelationship.to, fromUser), eq(table.userRelationship.from, toUser)),
				)
		).at(0);

		if (result) relationshipFromUser = result.relationship;
	}

	return { fromUser: relationshipFromUser, toUser: relationshipToUser };
};
