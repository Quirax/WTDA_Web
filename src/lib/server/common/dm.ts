import { DMChannelType, UserRelationship } from '@app';
import { db, generateID, table } from '../db';
import {
	and,
	desc,
	eq,
	lte,
	max,
	SQL,
	Subquery,
	type ExtractTablesWithRelations,
} from 'drizzle-orm';
import { getRelationship } from './relationship';
import { alias, intersect, PgTransaction, union } from 'drizzle-orm/pg-core';
import type { DMChannel, dmChannel, DMParticipant, User } from '../db/schema';
import { message } from 'sveltekit-superforms';
import { string } from 'zod';
import type { PostgresJsQueryResultHKT } from 'drizzle-orm/postgres-js';

type Transaction =
	| PgTransaction<
			PostgresJsQueryResultHKT,
			Record<string, never>,
			ExtractTablesWithRelations<Record<string, never>>
	  >
	| typeof db;

export const createDMChannel = async (
	mainTx: Transaction,
	type = DMChannelType.GENERAL,
	relatedArticle?: string,
) => {
	const channelId = generateID();

	await mainTx.insert(table.dmChannel).values({
		id: channelId,
		type,
		relatedArticle,
	});

	return channelId;
};

export const joinToChannel = async (mainTx: Transaction, userId: string, channelId: string) => {
	await mainTx.transaction(async (tx) => {
		await tx.insert(table.dmParticipant).values({
			channelId,
			participantId: userId,
		});

		await tx.insert(table.dmContent).values({
			channelId,
			messageId: generateID(),
			sender: userId,
			content: {
				type: 'join',
			},
		});
	});
};

export const leaveFromChannel = async (mainTx: Transaction, userId: string, channelId: string) => {
	await mainTx.transaction(async (tx) => {
		await tx
			.delete(table.dmParticipant)
			.where(
				and(
					eq(table.dmParticipant.channelId, channelId),
					eq(table.dmParticipant.participantId, userId),
				),
			);

		await tx.insert(table.dmContent).values({
			channelId,
			messageId: generateID(),
			sender: userId,
			content: {
				type: 'leave',
			},
		});
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
			})
			.from(table.dmParticipant)
			.where(eq(table.dmParticipant.participantId, userId));

	const userWithLatestMessage = db
		.select({
			channelId: table.dmParticipant.channelId,
			sentAt: latestMessage.sentAt,
			content: table.dmContent.content,
			messageId: table.dmContent.messageId,
			sender: { ...table.user },
		})
		.from(table.dmParticipant)
		.where(eq(table.dmParticipant.participantId, fromUser))
		.innerJoin(latestMessage, eq(latestMessage.channelId, table.dmParticipant.channelId))
		.innerJoin(table.dmContent, eq(table.dmContent.sentAt, latestMessage.sentAt))
		.innerJoin(table.user, eq(table.user.id, table.dmContent.sender))
		.as('sq');

	let subquery = toUser
		? intersect(userQuery(fromUser), userQuery(toUser)).as('sq')
		: userWithLatestMessage;

	const participant = alias(table.user, 'participant');

	const rows = await db
		.select({
			channel: {
				id: subquery.channelId,
				type: table.dmChannel.type,
				relatedArticle: table.dmChannel.relatedArticle,
				createdDate: table.dmChannel.createdDate,
				closedDate: table.dmChannel.closedDate,
			},
			...(!toUser
				? {
						latestMessage: {
							sentAt: userWithLatestMessage.sentAt,
							content: userWithLatestMessage.content,
							messageId: userWithLatestMessage.messageId,
						},
						latestMessageSender: userWithLatestMessage.sender,
						participant: {
							...participant,
							id: table.dmParticipant.participantId,
						},
					}
				: {}),
		})
		.from(subquery)
		.where(additionalWhere?.(subquery, table.dmChannel))
		.innerJoin(table.dmChannel, eq(table.dmChannel.id, subquery.channelId))
		.innerJoin(table.dmParticipant, eq(table.dmParticipant.channelId, subquery.channelId))
		.innerJoin(participant, eq(participant.id, table.dmParticipant.participantId));

	const result = rows.reduce<
		Record<DMChannel['id'], DMChannel & { participants: User[]; latestMessage?: App.DM }>
	>((acc, row) => {
		const channel = row.channel;
		const participant = row.participant;

		if (!acc[channel.id]) {
			acc[channel.id] = {
				...channel,
				participants: [],
				latestMessage: row.latestMessage && {
					id: row.latestMessage.messageId,
					sentAt: row.latestMessage.sentAt || new Date(),
					sender: row.latestMessageSender || null,
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
			and(eq(ch.type, type), relatedArticle ? eq(ch.relatedArticle, relatedArticle) : undefined),
		)
	).at(0);
	if (result) return result.id;

	return await db.transaction(async (tx) => {
		// 채널 생성
		const channelId = await createDMChannel(tx, type, relatedArticle);

		// 해당 채널에 가입
		await joinToChannel(tx, fromUser, channelId);
		await joinToChannel(tx, toUser, channelId);

		// 해당 채널 ID를 반환
		return channelId;
	});
};

export const getDMChannelInfo = async (channelId: string) => {
	const channelInfo = (
		await db
			.select({
				type: table.dmChannel.type,
				relatedArticle: table.dmChannel.relatedArticle,
			})
			.from(table.dmChannel)
			.where(eq(table.dmChannel.id, channelId))
	).at(0);

	const participants = await db
		.select({
			participant: table.user,
		})
		.from(table.dmParticipant)
		.where(eq(table.dmParticipant.channelId, channelId))
		.innerJoin(table.user, eq(table.user.id, table.dmParticipant.participantId));

	return { ...channelInfo, participants: participants.map((v) => v.participant) };
};

export type DMChannelInfo = Awaited<ReturnType<typeof getDMChannelInfo>>;

export const get = async (channelId: string, before: Date) => {
	const rmContent = alias(table.dmContent, 'rm_content');
	const rmSender = alias(table.user, 'rm_sender');

	const result = await db
		.select({
			id: table.dmContent.messageId,
			sender: table.user,
			content: table.dmContent.content,
			sentAt: table.dmContent.sentAt,
			relatedMessage: {
				id: rmContent.messageId,
				content: rmContent.content,
				sentAt: rmContent.sentAt,
			},
			relatedMessageSender: rmSender,
		})
		.from(table.dmContent)
		.where(and(eq(table.dmContent.channelId, channelId), lte(table.dmContent.sentAt, before)))
		.innerJoin(table.user, eq(table.user.id, table.dmContent.sender))
		.leftJoin(
			rmContent,
			and(
				eq(rmContent.channelId, table.dmContent.channelId),
				eq(rmContent.messageId, table.dmContent.relatedMessage),
			),
		)
		.leftJoin(rmSender, eq(rmSender.id, rmContent.sender));
	// TODO: 일정 범위 이내의 값만 가져오도록 변경

	return result.map<App.DM>((v) => ({
		id: v.id,
		sender: v.sender,
		sentAt: v.sentAt,
		...v.content,
		relatedMessage:
			(v.relatedMessage && {
				id: v.relatedMessage.id,
				sender: v.relatedMessageSender,
				sentAt: v.relatedMessage.sentAt,
				...v.relatedMessage.content,
			}) ||
			undefined,
	}));
};

export const send = async (
	channelId: string,
	sender: NonNullable<App.User>,
	content: Omit<App.DM, 'id' | 'sentAt' | 'sender'>,
	relatedMessage?: string,
) => {
	const messageId = generateID();
	const sentAt = new Date();

	const _relatedMessage = await db.transaction(async (tx) => {
		await tx.insert(table.dmContent).values({
			channelId,
			messageId,
			sender: sender.id,
			content,
			sentAt,
			relatedMessage,
		});

		const attachments =
			(content.type === 'general' && (content as App.GeneralDM).attachments) || undefined;

		if (attachments)
			await tx.insert(table.filesPerDM).values(
				attachments
					.flatMap((v) => [...v.matchAll(/api\/file\/([A-Za-z0-9-\/]+)/g)])
					.map((path) => ({
						channelId,
						messageId,
						path: path[1],
					})),
			);

		return (
			(relatedMessage &&
				(
					await tx
						.select({
							id: table.dmContent.messageId,
							sender: table.user,
							content: table.dmContent.content,
							sentAt: table.dmContent.sentAt,
						})
						.from(table.dmContent)
						.where(
							and(
								eq(table.dmContent.channelId, channelId),
								eq(table.dmContent.messageId, relatedMessage),
							),
						)
						.innerJoin(table.user, eq(table.user.id, table.dmContent.sender))
				).at(0)) ||
			undefined
		);
	});

	return [
		{
			id: messageId,
			sender: sender,
			sentAt,
			...content,
			relatedMessage: _relatedMessage && {
				id: _relatedMessage.id,
				sender: _relatedMessage.sender,
				sentAt: _relatedMessage.sentAt,
				..._relatedMessage.content,
			},
		},
	];
};
