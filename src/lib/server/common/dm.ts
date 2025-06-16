import { DMChannelType } from '@app';
import { db, generateID, table } from '../db';
import { and, eq } from 'drizzle-orm';

export const createDMChannel = async (type = DMChannelType.GENERAL, relatedArticle?: string) => {
	const channelId = generateID();

	await db.insert(table.dmChannel).values({
		id: channelId,
		type,
		relatedArticle,
	});

	return channelId;
};

export const joinToChannel = async (userId: string, channelId: string) => {
	await db.insert(table.dmParticipant).values({
		channelId,
		participantId: userId,
	});

	await db.insert(table.dmContent).values({
		channelId,
		messageId: generateID(),
		sender: userId,
		content: {
			type: 'join',
		},
	});
};

export const leaveFromChannel = async (userId: string, channelId: string) => {
	await db
		.delete(table.dmParticipant)
		.where(
			and(
				eq(table.dmParticipant.channelId, channelId),
				eq(table.dmParticipant.participantId, userId),
			),
		);

	await db.insert(table.dmContent).values({
		channelId,
		messageId: generateID(),
		sender: userId,
		content: {
			type: 'leave',
		},
	});
};
