import { enumToPgEnum, type InferSelectModelPartial } from '../../utils';
import {
	pgTable,
	text,
	timestamp,
	pgEnum,
	json,
	integer,
	boolean,
	index,
	date,
	unique,
	type PgColumnBuilderBase,
	type PgTableExtraConfigValue,
	primaryKey,
	foreignKey,
} from 'drizzle-orm/pg-core';
import {
	AdultContents,
	ArticleCategory,
	DMChannelType,
	EmailConfirmFor,
	UserRelationship,
	UserStatus,
} from '../../../app';
import { sql, type BuildExtraConfigColumns } from 'drizzle-orm';
import type { Emoji } from 'emoji-type';

export const statusEnum = pgEnum('status', enumToPgEnum(UserStatus));
export const emailConfirmFor = pgEnum('email_confirm_for', enumToPgEnum(EmailConfirmFor));
export const articleCategory = pgEnum('article_category', enumToPgEnum(ArticleCategory));
export const adultContents = pgEnum('adult_contents', enumToPgEnum(AdultContents));
export const relationshipEnum = pgEnum('user_relationship_enum', enumToPgEnum(UserRelationship));
export const dmChannelType = pgEnum('dm_channel_type', enumToPgEnum(DMChannelType));

export const user = pgTable(
	'user',
	{
		id: text('id').primaryKey(),
		username: text('username').notNull().unique(), // 닉네임
		passwordHash: text('password_hash').notNull(), // 비밀번호
		profileImage: text('profile_image'), // 프로필 이미지
		email: text('email').notNull().unique(), // 이메일
		status: statusEnum().notNull().default(UserStatus.REQUIRED_EMAIL_CONFIRM), // 사용자 상태
		preferences: json('preferences').$type<Partial<App.Preferences>>().notNull().default({}),
		profile: json('profile').$type<Partial<App.Profile>>().notNull().default({}),
		birthday: timestamp('birthday', { withTimezone: true, mode: 'date' }),
		authExpiresAt: timestamp('auth_expires_at', { withTimezone: true, mode: 'date' }),
	},
	(table) => [index('username_idx').using('gin', table.username.op('gin_bigm_ops'))],
);

export const userRelationship = pgTable(
	'user_relationship',
	{
		from: text('from')
			.notNull()
			.references(() => user.id),
		to: text('to')
			.notNull()
			.references(() => user.id),
		relationship: relationshipEnum('relationship').notNull().default(UserRelationship.BLOCKED),
	},
	(table) => [primaryKey({ columns: [table.from, table.to] })],
);

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull(),
});

export const emailConfirm = pgTable('email_confirm', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull(),
	for: emailConfirmFor().notNull(),
	confirmCode: text('confirm_code').notNull(),
});

export const profileAnnouncements = pgTable('profile_announcements', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	title: text('title').notNull(),
	content: text('content').notNull().default(''),
	// ref: https://orm.drizzle.team/docs/guides/timestamp-default-value
	createDate: timestamp('create_date', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

const articleTable = <
	TTableName extends string,
	TColumnsMap extends Record<string, PgColumnBuilderBase>,
>(
	name: TTableName,
	columns: TColumnsMap,
	extraConfig?: (
		self: BuildExtraConfigColumns<TTableName, TColumnsMap, 'pg'>,
	) => PgTableExtraConfigValue[],
) =>
	pgTable(
		name,
		{
			id: text('id').primaryKey(),
			thumbnail: text('thumbnail'),
			title: text('title').notNull(),
			author: text('author')
				.notNull()
				.references(() => user.id),
			category: articleCategory().notNull(),
			tags: text('tags')
				.array()
				.notNull()
				.default(sql`'{}'::text[]`),
			createDate: timestamp('create_date', { withTimezone: true, mode: 'date' })
				.notNull()
				.defaultNow(),
			modifyDate: timestamp('modify_date', { withTimezone: true, mode: 'date' })
				.notNull()
				.defaultNow(),
			content: text('content').notNull().default(''),
			containsAdultContents: adultContents().notNull().default(AdultContents.NORMAL),
			...columns,
		},
		// ref: https://orm.drizzle.team/docs/indexes-constraints#indexes
		// ref: https://velog.io/@identity230c/postgresql-%EB%AC%B8%EC%9E%90%EC%97%B4-%EA%B2%80%EC%83%89#pg_trgm-vs-pg_bigm
		(table) => [
			index(`${name}_title_idx`).using('gin', table.title.op('gin_bigm_ops')),
			index(`${name}_content_idx`).using('gin', table.content.op('gin_bigm_ops')),
			...(extraConfig?.(table) || []),
		],
	);

export const commissionRequest = articleTable('commission_request', {
	budget: integer('budget'), // null: 조율 가능
	deadline: timestamp('deadline', { withTimezone: true, mode: 'date' }), // null: 조율 가능
	isForCommercial: boolean().notNull().default(false),
	purpose: text('purpose').notNull(),
	visibleOnlyToCommissioner: boolean().notNull().default(false),
});

export const portfolio = articleTable('portfolio', {
	media: text('media')
		.array()
		.notNull()
		.default(sql`'{}'::text[]`),
	publishDate: timestamp('publishDate', { withTimezone: true, mode: 'date' }), // null: 공개일 미상
});

export const dmChannel = pgTable('dm_channel', {
	id: text('id').primaryKey(),
	type: dmChannelType('type').notNull().default(DMChannelType.GENERAL),
	relatedArticle: text('related_article'),
	createdDate: timestamp('created_date', { withTimezone: true, mode: 'date' }).defaultNow(),
	closedDate: timestamp('closed_date', { withTimezone: true, mode: 'date' }),
});

export const dmParticipant = pgTable('dm_participant', {
	channelId: text('channel_id')
		.notNull()
		.references(() => dmChannel.id, { onDelete: 'cascade' }),
	participantId: text('participant_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
});

export const dmContent = pgTable(
	'dm_content',
	{
		channelId: text('channel_id')
			.notNull()
			.references(() => dmChannel.id, { onDelete: 'cascade' }),
		messageId: text('message_id').notNull(),
		sender: text('sender')
			.notNull()
			.references(() => user.id),
		content: json('content').notNull().default({}),
		sentAt: timestamp('sent_at', { withTimezone: true, mode: 'date' }).defaultNow(),
	},
	(table) => [primaryKey({ columns: [table.channelId, table.messageId] })],
);

export const dmReceived = pgTable(
	'dm_received',
	{
		channelId: text('channel_id').notNull(),
		messageId: text('message_id').notNull(),
		receiver: text('receiver')
			.notNull()
			.references(() => user.id),
	},
	(table) => [
		foreignKey({
			columns: [table.channelId, table.messageId],
			foreignColumns: [dmContent.channelId, dmContent.messageId],
			name: 'dm_received_foreign_key',
		}).onDelete('cascade'),
		primaryKey({ columns: [table.channelId, table.messageId, table.receiver] }),
	],
);

export const dmReactions = pgTable(
	'dm_reactions',
	{
		channelId: text('channel_id').notNull(),
		messageId: text('message_id').notNull(),
		setter: text('setter')
			.notNull()
			.references(() => user.id),
		emoji: text('setter').$type<Emoji>().notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.channelId, table.messageId],
			foreignColumns: [dmContent.channelId, dmContent.messageId],
			name: 'dm_reactions_foreign_key',
		}).onDelete('cascade'),
		primaryKey({ columns: [table.channelId, table.messageId, table.setter] }),
	],
);

export const files = pgTable('files', {
	path: text('path').primaryKey(),
	owner: text('owner')
		.notNull()
		.references(() => user.id),
});

// ref: https://orm.drizzle.team/docs/relations#foreign-key-actions
const filesPerArticle = (name: string, table: ReturnType<typeof articleTable>) =>
	pgTable(
		name,
		{
			articleId: text('article_id')
				.notNull()
				.references(() => table.id, { onDelete: 'cascade' }),
			path: text('path')
				.notNull()
				.references(() => files.path, { onDelete: 'cascade' }),
		},
		(table) => [unique().on(table.articleId, table.path)],
	);

export const filesPerRequest = filesPerArticle('files_per_request', commissionRequest);

export const filesPerPortfolio = filesPerArticle('files_per_portfolio', portfolio);

export const filesPerDM = pgTable(
	'files_per_dm',
	{
		channelId: text('channel_id').notNull(),
		messageId: text('message_id').notNull(),
		path: text('path')
			.notNull()
			.references(() => files.path, { onDelete: 'cascade' }),
	},
	(table) => [
		foreignKey({
			columns: [table.channelId, table.messageId],
			foreignColumns: [dmContent.channelId, dmContent.messageId],
			name: 'dm_received_foreign_key',
		}).onDelete('cascade'),
		unique().on(table.channelId, table.messageId, table.path),
	],
);

export const filesPerProfile = pgTable(
	'files_per_profile',
	{
		userId: text('user_id')
			.notNull()
			.references(() => user.id),
		path: text('path')
			.notNull()
			.references(() => files.path, { onDelete: 'cascade' }),
	},
	(table) => [unique().on(table.userId, table.path)],
);

export type Session = typeof session.$inferSelect;
export type User = typeof user.$inferSelect;
export type EmailConfirm = typeof emailConfirm.$inferSelect;
export type ProfileAnnouncements = typeof profileAnnouncements.$inferSelect;
export type Article = ReturnType<typeof articleTable>['$inferSelect'];
export type CommissionRequest = typeof commissionRequest.$inferSelect;
export type Portfolio = typeof portfolio.$inferSelect;
export type Files = typeof files.$inferSelect;
export type FilesPerArticle = ReturnType<typeof filesPerArticle>['$inferSelect'];
export type filesPerProfile = typeof filesPerProfile.$inferSelect;
export type DMChannel = typeof dmChannel.$inferSelect;
export type DMParticipant = typeof dmParticipant.$inferSelect;
export type DMContent = typeof dmContent.$inferSelect;
export type DMReceived = typeof dmReceived.$inferSelect;
export type FilesPerDM = typeof filesPerDM.$inferSelect;
