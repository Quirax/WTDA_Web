import { enumToPgEnum } from '$lib/utils';
import { pgTable, serial, text, integer, timestamp, pgEnum, json } from 'drizzle-orm/pg-core';
import { UserStatus } from '../../../app';

export const user = pgTable('user', {
	id: text('id').primaryKey(),
	// age: integer('age'),
	username: text('username').notNull().unique(), // 닉네임
	passwordHash: text('password_hash').notNull(), // 비밀번호
	profileImage: text('profile_image'), // 프로필 이미지
	fallbackInitial: text('fallback_initial').notNull(), // 이니셜
	email: text('email').notNull().unique(), // 이메일
	status: pgEnum('status', enumToPgEnum(UserStatus))('status')
		.notNull()
		.default(UserStatus.REQUIRED_EMAIL_CONFIRM), // 사용자 상태
	preferences: json(),
});

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull(),
});

export type Session = typeof session.$inferSelect;

export type User = typeof user.$inferSelect;
