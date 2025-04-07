import { enumToPgEnum } from '../../utils';
import { pgTable, text, timestamp, pgEnum, json } from 'drizzle-orm/pg-core';
import { EmailConfirmFor, UserStatus } from '../../../app';

export const statusEnum = pgEnum('status', enumToPgEnum(UserStatus));
export const emailConfirmFor = pgEnum('email_confirm_for', enumToPgEnum(EmailConfirmFor));

export const user = pgTable('user', {
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
});

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

export type Session = typeof session.$inferSelect;
export type User = typeof user.$inferSelect;
export type EmailConfirm = typeof emailConfirm.$inferSelect;
export type ProfileAnnouncements = typeof profileAnnouncements.$inferSelect;
