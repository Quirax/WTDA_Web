import { DMChannelType, UserRelationship } from '@app';
import { db, generateID, table } from '../db';
import { and, desc, eq, max, SQL, Subquery } from 'drizzle-orm';
import { getRelationship } from './relationship';
import { union } from 'drizzle-orm/pg-core';
import type { DMChannel, dmChannel, DMParticipant, User } from '../db/schema';
import { message } from 'sveltekit-superforms';

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
	additionalWhere?: (part: Subquery, ch: typeof table.dmChannel) => SQL | undefined,
) => {
	const latestMessage = db
		.select({
			channelId: table.dmContent.channelId,
			sentAt: max(table.dmContent.sentAt).as('sentAt'),
		})
		.from(table.dmContent)
		.groupBy((t) => t.channelId)
		.as('lm');

	const userQuery = (userId: string) =>
		db
			.select({
				channelId: table.dmParticipant.channelId,
				sentAt: latestMessage.sentAt,
				content: table.dmContent.content,
				messageId: table.dmContent.messageId,
				sender: table.user,
			})
			.from(table.dmParticipant)
			.where(eq(table.dmParticipant.participantId, userId))
			.innerJoin(latestMessage, eq(latestMessage.channelId, table.dmParticipant.channelId))
			.innerJoin(table.dmContent, eq(table.dmContent.sentAt, latestMessage.sentAt))
			.innerJoin(table.user, eq(table.dmContent.sender, table.user.id));

	const fromUserQuery = userQuery(fromUser);

	let subquery = (toUser ? union(fromUserQuery, userQuery(toUser)) : fromUserQuery).as('sq');

	const rows = await db
		.select({
			channel: {
				id: subquery.channelId,
				type: table.dmChannel.type,
				relatedArticle: table.dmChannel.relatedArticle,
				createdDate: table.dmChannel.createdDate,
				closedDate: table.dmChannel.closedDate,
			},
			latestMessage: {
				sentAt: subquery.sentAt,
				content: subquery.content,
				messageId: subquery.messageId,
			},
			latestMessageSender: subquery.sender,
			participant: {
				...table.user,
				id: table.dmParticipant.participantId,
			},
		})
		.from(subquery)
		.where(additionalWhere?.(subquery, table.dmChannel))
		.innerJoin(table.dmChannel, eq(table.dmChannel.id, subquery.channelId))
		.innerJoin(table.dmParticipant, eq(table.dmParticipant.channelId, subquery.channelId))
		.innerJoin(table.user, eq(table.user.id, table.dmParticipant.participantId));

	const result = rows.reduce<
		Record<DMChannel['id'], DMChannel & { participants: User[]; latestMessage: App.DM }>
	>((acc, row) => {
		const channel = row.channel;
		const participant = row.participant;

		if (!acc[channel.id]) {
			acc[channel.id] = {
				...channel,
				participants: [],
				latestMessage: {
					id: row.latestMessage.messageId,
					sentAt: row.latestMessage.sentAt || new Date(),
					sender: row.latestMessageSender,
					...row.latestMessage.content,
				},
			};
		}

		if (participant) {
			acc[channel.id].participants.push(participant);
		}
		return acc;
	}, {});

	return Object.values(result);
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
	const result = (
		await getDMChannels(fromUser, toUser, (_, ch) =>
			type === DMChannelType.GENERAL
				? eq(ch.type, type)
				: and(
						eq(ch.type, type),
						relatedArticle ? eq(ch.relatedArticle, relatedArticle) : undefined,
					),
		)
	).at(0);
	if (result) return result.id;

	// 채널 생성
	const channelId = await createDMChannel(type, relatedArticle);

	// 해당 채널에 가입
	await joinToChannel(fromUser, channelId);
	await joinToChannel(toUser, channelId);

	// 해당 채널 ID를 반환
	return channelId;
};
