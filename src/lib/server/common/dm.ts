import { DMChannelType, UserRelationship } from '@app';
import { db, generateID, table } from '../db';
import {
	and,
	asc,
	count,
	desc,
	eq,
	isNull,
	lte,
	max,
	ne,
	or,
	sql,
	SQL,
	Subquery,
	type ExtractTablesWithRelations,
} from 'drizzle-orm';
import { getRelationship } from './relationship';
import { alias, intersect, PgTransaction, union } from 'drizzle-orm/pg-core';
import type { DMChannel, dmChannel, DMParticipant, User } from '../db/schema';
import * as telecom from './telecom';
import type { PostgresJsQueryResultHKT } from 'drizzle-orm/postgres-js';
import type { Emoji } from 'emoji-type';
import { dmsPerPage } from '$lib/config';
import { aliasedColumn } from '../db/shorthands';

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

export const joinToChannel = async (
	mainTx: Transaction,
	user: NonNullable<App.User>,
	channelId: string,
) => {
	const dm = await mainTx.transaction(async (tx) => {
		await tx.insert(table.dmParticipant).values({
			channelId,
			participantId: user.id,
		});

		const dm: App.DM = {
			id: generateID(),
			type: 'leave',
			sentAt: new Date(),
			sender: user,
		};

		await tx.insert(table.dmContent).values({
			channelId,
			messageId: dm.id,
			sender: user.id,
			content: {
				type: 'join',
			},
		});

		return dm;
	});

	(
		await db
			.select({ uid: table.dmParticipant.participantId })
			.from(table.dmParticipant)
			.where(eq(table.dmParticipant.channelId, channelId))
	).forEach(({ uid }) => {
		telecom.notify(uid, { event: 'join', channelId, userId: user.id });
		telecom.notify(uid, { event: 'dmSent', channelId, dms: [dm] });
	});
};

export const leaveFromChannel = async (
	mainTx: Transaction,
	user: NonNullable<App.User>,
	channelId: string,
) => {
	const dm = await mainTx.transaction(async (tx) => {
		await tx
			.delete(table.dmParticipant)
			.where(
				and(
					eq(table.dmParticipant.channelId, channelId),
					eq(table.dmParticipant.participantId, user.id),
				),
			);

		const dm: App.DM = {
			id: generateID(),
			type: 'leave',
			sentAt: new Date(),
			sender: user,
		};

		await tx.insert(table.dmContent).values({
			channelId,
			messageId: dm.id,
			sender: user.id,
			content: {
				type: 'leave',
			},
		});

		return dm;
	});

	telecom.notify(user.id, { event: 'leave', channelId, userId: user.id });

	(
		await db
			.select({ uid: table.dmParticipant.participantId })
			.from(table.dmParticipant)
			.where(eq(table.dmParticipant.channelId, channelId))
	).forEach(({ uid }) => {
		telecom.notify(uid, { event: 'leave', channelId, userId: user.id });
		telecom.notify(uid, { event: 'dmSent', channelId, dms: [dm] });
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
		Record<
			DMChannel['id'],
			DMChannel & { participants: Record<User['id'], User>; latestMessage?: App.DM }
		>
	>((acc, row) => {
		const channel = row.channel;
		const participant = row.participant;

		if (!acc[channel.id]) {
			acc[channel.id] = {
				...channel,
				participants: {},
				latestMessage: row.latestMessage && {
					id: row.latestMessage.messageId,
					sentAt: row.latestMessage.sentAt || new Date(),
					sender: row.latestMessageSender || null,
					...row.latestMessage.content,
				},
			};
		}

		if (participant) {
			acc[channel.id].participants[participant.id] = participant;
		}
		return acc;
	}, {});

	return Object.values(result).map((acc) => ({
		...acc,
		participants: Object.values(acc.participants),
	}));
};

export const beginDMProc = async (
	fromUser: NonNullable<App.User>,
	toUser: NonNullable<App.User>,
	type = DMChannelType.GENERAL,
	relatedArticle?: string,
) => {
	// 자기 자신과 DM할 수 없음
	if (fromUser.id === toUser.id) throw new Error('Cannot chat with yourself', { cause: 400 });

	// 어느 한 쪽이 차단한 경우 DM할 수 없음
	const relationship = await getRelationship(fromUser.id, toUser.id);

	if (
		relationship.fromUser === UserRelationship.BLOCKED ||
		relationship.toUser === UserRelationship.BLOCKED
	)
		throw new Error('Cannot chat with blocked user', { cause: 403 });

	// 이미 채널이 있는 경우 해당 채널의 ID 반환
	const result = (
		await getDMChannels(fromUser.id, toUser.id, (_, ch) =>
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

		telecom.notify(fromUser.id, { event: 'join', channelId, userId: fromUser.id });
		telecom.notify(toUser.id, { event: 'join', channelId, userId: toUser.id });

		// 해당 채널 ID를 반환
		return channelId;
	});
};

export const getDMChannelInfo = async (channelId: string, sender: NonNullable<App.User>) => {
	const channelInfo = (
		await db
			.select({
				type: table.dmChannel.type,
				relatedArticle: table.dmChannel.relatedArticle,
			})
			.from(table.dmChannel)
			.where(eq(table.dmChannel.id, channelId))
	).at(0);

	const participants = (
		await db
			.select({
				participant: table.user,
			})
			.from(table.dmParticipant)
			.where(eq(table.dmParticipant.channelId, channelId))
			.innerJoin(table.user, eq(table.user.id, table.dmParticipant.participantId))
	).map((v) => v.participant);

	if (participants.map((u) => u.id).indexOf(sender.id) === -1)
		throw Error('You are not participated', { cause: 403 });

	return {
		...channelInfo,
		participants: participants,
		isAbleToSend: await isAbleToSend(channelId, sender),
	};
};

export type DMChannelInfo = Awaited<ReturnType<typeof getDMChannelInfo>>;

export const get = async (channelId: string, before: Date, me: NonNullable<App.User>) => {
	const rmContent = alias(table.dmContent, 'rm_content');
	const rmSender = alias(table.user, 'rm_sender');

	const reactions = db
		.select({
			messageId: table.dmReactions.messageId,
			emoji: table.dmReactions.emoji,
			count: count(table.dmReactions.setter),
		})
		.from(table.dmReactions)
		.where(eq(table.dmReactions.channelId, channelId))
		.groupBy((t) => [t.messageId, t.emoji])
		.as('reactions');

	const metadata = db
		.select({
			id: table.dmContent.messageId,
			sentAt: table.dmContent.sentAt,
			reactions: sql<(typeof reactions)[]>`json_agg(reactions)`.as('reactions'),
		})
		.from(table.dmContent)
		// 참고: sql.placeholder는 Date 형식에 대해 사용 불가하여 현행 유지
		.where(and(eq(table.dmContent.channelId, channelId), lte(table.dmContent.sentAt, before)))
		.leftJoin(reactions, eq(reactions.messageId, table.dmContent.messageId))
		.groupBy((t) => [t.id, t.sentAt])
		.orderBy((t) => desc(t.sentAt))
		.limit(dmsPerPage)
		.as('metadata');

	const result = await db
		.select({
			id: metadata.id,
			sender: table.user,
			content: table.dmContent.content,
			sentAt: metadata.sentAt,
			relatedMessage: {
				id: rmContent.messageId,
				content: rmContent.content,
				sentAt: rmContent.sentAt,
			},
			relatedMessageSender: rmSender,
			reactions: metadata.reactions,
			myReaction: table.dmReactions.emoji,
		})
		.from(metadata)
		.innerJoin(
			table.dmContent,
			and(eq(table.dmContent.channelId, channelId), eq(table.dmContent.messageId, metadata.id)),
		)
		.innerJoin(table.user, eq(table.user.id, table.dmContent.sender))
		.leftJoin(
			rmContent,
			and(
				eq(rmContent.channelId, table.dmContent.channelId),
				eq(rmContent.messageId, table.dmContent.relatedMessage),
			),
		)
		.leftJoin(rmSender, eq(rmSender.id, rmContent.sender))
		.leftJoin(
			table.dmReactions,
			and(
				eq(table.dmReactions.channelId, channelId),
				eq(table.dmReactions.messageId, metadata.id),
				eq(table.dmReactions.setter, me.id),
			),
		)
		.orderBy((t) => asc(t.sentAt));

	// 읽음 확인
	if (result.length > 0) {
		await db
			.insert(table.dmReceived)
			.values(
				result.map((message) => ({
					channelId,
					messageId: message.id,
					receiver: me.id,
				})),
			)
			.onConflictDoNothing();
	}

	return result.map<App.DM>((v) => ({
		id: v.id,
		sender: v.sender,
		sentAt: v.sentAt,
		reactions:
			v.reactions[0] === null
				? undefined
				: Object.fromEntries(v.reactions.map((r) => [r.emoji, r.count])),
		myReaction: v.myReaction || undefined,
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

const relationshipToUser = alias(table.userRelationship, 'relationshipToUser');
const relationshipFromUser = alias(table.userRelationship, 'relationshipFromUser');

const ableToSendSubquery = db
	.select({
		participant: table.dmParticipant.participantId,
		relationshipToUser: aliasedColumn(relationshipToUser.relationship, 'relationshipToUser'),
		relationshipFromUser: aliasedColumn(relationshipFromUser.relationship, 'relationshipFromUser'),
	})
	.from(table.dmParticipant)
	.where(
		and(
			eq(table.dmParticipant.channelId, sql.placeholder('channelId')),
			ne(table.dmParticipant.participantId, sql.placeholder('senderId')),
		),
	)
	.leftJoin(
		relationshipToUser,
		and(
			eq(relationshipToUser.from, sql.placeholder('senderId')),
			eq(relationshipToUser.to, table.dmParticipant.participantId),
		),
	)
	.leftJoin(
		relationshipFromUser,
		and(
			eq(relationshipFromUser.to, sql.placeholder('senderId')),
			eq(relationshipFromUser.from, table.dmParticipant.participantId),
		),
	)
	.as('sq');

const ableToSendQuery = db
	.select()
	.from(ableToSendSubquery)
	.where(
		and(
			or(
				isNull(ableToSendSubquery.relationshipFromUser),
				ne(ableToSendSubquery.relationshipFromUser, UserRelationship.BLOCKED),
			),
			or(
				isNull(ableToSendSubquery.relationshipToUser),
				ne(ableToSendSubquery.relationshipToUser, UserRelationship.BLOCKED),
			),
		),
	);

export const isAbleToSend = async (channelId: string, sender: NonNullable<App.User>) => {
	const result = await ableToSendQuery.execute({
		channelId,
		senderId: sender.id,
	});

	return result.length > 0;
};

export const send = async (
	channelId: string,
	sender: NonNullable<App.User>,
	content: Omit<App.DM, 'id' | 'sentAt' | 'sender'>,
	relatedMessage?: string,
) => {
	const messageId = generateID();
	const sentAt = new Date();

	if (!(await isAbleToSend(channelId, sender))) throw Error('Not able to send', { cause: 406 });

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

		// 읽음 확인
		await tx.insert(table.dmReceived).values({
			channelId,
			messageId,
			receiver: sender.id,
		});

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

	const dms = [
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

	(
		await db
			.select({ uid: table.dmParticipant.participantId })
			.from(table.dmParticipant)
			.where(eq(table.dmParticipant.channelId, channelId))
	).forEach(({ uid }) => {
		telecom.notify(uid, { event: 'dmSent', channelId, dms });
	});

	return dms;
};

// ref: https://orm.drizzle.team/docs/perf-queries#placeholder
const deleteReact = db
	.delete(table.dmReactions)
	.where(
		and(
			eq(table.dmReactions.channelId, sql.placeholder('channelId')),
			eq(table.dmReactions.messageId, sql.placeholder('messageId')),
			eq(table.dmReactions.setter, sql.placeholder('setter')),
		),
	);

const upsertReact = db.insert(table.dmReactions).values({
	channelId: sql.placeholder('channelId'),
	messageId: sql.placeholder('messageId'),
	setter: sql.placeholder('setter'),
	emoji: sql.placeholder('emoji'),
});

export const react = async (
	channelId: string,
	messageId: string,
	setter: NonNullable<App.User>,
	emoji: Nullable<Emoji>,
) => {
	if (!emoji) {
		await deleteReact.execute({
			channelId,
			messageId,
			setter: setter.id,
		});
	} else {
		await upsertReact
			.onConflictDoUpdate({
				target: [
					table.dmReactions.channelId,
					table.dmReactions.messageId,
					table.dmReactions.setter,
				],
				set: {
					emoji,
				},
			})
			.execute({
				channelId,
				messageId,
				emoji,
				setter: setter.id,
			});
	}
};
