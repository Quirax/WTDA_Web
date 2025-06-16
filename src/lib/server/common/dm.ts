import { DMChannelType, UserRelationship } from '@app';
import { db, generateID, table } from '../db';
import { and, eq, SQL, Subquery } from 'drizzle-orm';
import { getRelationship } from './relationship';
import { union } from 'drizzle-orm/pg-core';

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

export const getDMChannels = async (
	fromUser: string,
	toUser?: string,
	additionalWhere?: (part: Subquery, ch: typeof table.dmChannel) => SQL,
) => {
	const fromUserQuery = db
		.select()
		.from(table.dmParticipant)
		.where(eq(table.dmParticipant.participantId, fromUser));

	let subquery = (
		toUser
			? union(
					fromUserQuery,
					db
						.select()
						.from(table.dmParticipant)
						.where(toUser ? eq(table.dmParticipant.participantId, toUser) : undefined),
				)
			: fromUserQuery
	).as('sq');

	return await db
		.select({
			id: subquery.channelId,
			type: table.dmChannel.type,
			relatedArticle: table.dmChannel.relatedArticle,
			createdDate: table.dmChannel.createdDate,
			closedDate: table.dmChannel.closedDate,
		})
		.from(subquery)
		.where(additionalWhere?.(subquery, table.dmChannel))
		.innerJoin(table.dmChannel, eq(table.dmChannel.id, subquery.channelId));
};

export const beginDMProc = async (
	fromUser: string,
	toUser: string,
	type = DMChannelType.GENERAL,
	relatedArticle?: string,
) => {
	// 자기 자신과 DM할 수 없음
	if (fromUser === toUser) throw new Error('Cannot chat with yourself', { cause: 400 });

	// 어느 한 쪽이 차단한 경우 DM할 수 없음
	const relationship = await getRelationship(fromUser, toUser);

	if (
		relationship.fromUser === UserRelationship.BLOCKED ||
		relationship.toUser === UserRelationship.BLOCKED
	)
		throw new Error('Cannot chat with blocked user', { cause: 403 });

	// 이미 채널이 있는 경우 해당 채널의 ID 반환
	const result = (await getDMChannels(fromUser, toUser, (_, ch) => eq(ch.type, type))).at(0);
	if (result) return result.id;

	// 채널 생성
	const channelId = await createDMChannel(type, relatedArticle);

	// 해당 채널에 가입
	await joinToChannel(fromUser, channelId);
	await joinToChannel(toUser, channelId);

	// 해당 채널 ID를 반환
	return channelId;
};
