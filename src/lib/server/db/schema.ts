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
} from 'drizzle-orm/pg-core';
import { ArticleCategory, EmailConfirmFor, UserStatus } from '../../../app';
import { sql } from 'drizzle-orm';

export const statusEnum = pgEnum('status', enumToPgEnum(UserStatus));
export const emailConfirmFor = pgEnum('email_confirm_for', enumToPgEnum(EmailConfirmFor));
export const articleCategory = pgEnum('article_category', enumToPgEnum(ArticleCategory));

export const user = pgTable(
	'user',
	{
		id: text('id').primaryKey(),
		// age: integer('age'),
		username: text('username').notNull().unique(), // 닉네임
		passwordHash: text('password_hash').notNull(), // 비밀번호
		profileImage: text('profile_image'), // 프로필 이미지
		// fallbackInitial: text('fallback_initial').notNull(), // 이니셜
		email: text('email').notNull().unique(), // 이메일
		status: statusEnum().notNull().default(UserStatus.REQUIRED_EMAIL_CONFIRM), // 사용자 상태
		preferences: json('preferences').$type<Partial<App.Preferences>>().notNull().default({}),
		profile: json('profile').$type<Partial<App.Profile>>().notNull().default({}),
	},
	(table) => [index('username_idx').using('gin', table.username.op('gin_bigm_ops'))],
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

const article = {
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
	createDate: timestamp('create_date', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	modifyDate: timestamp('modify_date', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	content: text('content').notNull().default(''),
	containsAdultContents: boolean().notNull().default(false),
};

export const commissionRequest = pgTable(
	'commission_request',
	{
		...article,
		budget: integer('budget'), // null: 조율 가능
		deadline: timestamp('deadline', { withTimezone: true, mode: 'date' }), // null: 조율 가능
		isForCommercial: boolean().notNull().default(false),
		purpose: text('purpose').notNull(),
		visibleOnlyToCommissioner: boolean().notNull().default(false),
	},
	// ref: https://orm.drizzle.team/docs/indexes-constraints#indexes
	// ref: https://velog.io/@identity230c/postgresql-%EB%AC%B8%EC%9E%90%EC%97%B4-%EA%B2%80%EC%83%89#pg_trgm-vs-pg_bigm
	(table) => [
		index('title_idx').using('gin', table.title.op('gin_bigm_ops')),
		index('content_idx').using('gin', table.content.op('gin_bigm_ops')),
	],
);

export type Session = typeof session.$inferSelect;
export type User = typeof user.$inferSelect;
export type EmailConfirm = typeof emailConfirm.$inferSelect;
export type ProfileAnnouncements = typeof profileAnnouncements.$inferSelect;
export type Article = InferSelectModelPartial<typeof article>;
export type CommissionRequest = typeof commissionRequest.$inferSelect;
