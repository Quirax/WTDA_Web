import type { RequestEvent } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase64url, encodeHexLowerCase } from '@oslojs/encoding';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import * as auth from '../auth';
import { EmailConfirmFor } from '../../../app';
import { emailExpiresIn } from '$lib/config';
import { generateRandomString, type RandomReader } from '@oslojs/crypto/random';

export const sessionCookieName = 'email-confirm-session';

export function generateSessionToken() {
	return auth.generateSessionToken();
}

const random: RandomReader = {
	read(bytes) {
		crypto.getRandomValues(bytes);
	},
};

export function generateConfirmCode() {
	const digit = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	return `${generateRandomString(random, digit, 5)}-${generateRandomString(random, digit, 5)}`;
}

export async function createSession(
	token: string,
	userId: string,
	confirmFor: EmailConfirmFor,
	confirmCode: string,
) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + emailExpiresIn * 1000),
		for: confirmFor,
		confirmCode: encodeHexLowerCase(sha256(new TextEncoder().encode(confirmCode))),
	};
	await db.insert(table.emailConfirm).values(session);
	return session;
}

export async function validateSessionToken(token: string, confirmCode: string) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const confirmCodeHash = encodeHexLowerCase(sha256(new TextEncoder().encode(confirmCode)));
	const [result] = await db
		.select({
			// Adjust user table here to tweak returned data
			user: {
				email: table.user.email,
			},
			emailConfirm: table.emailConfirm,
		})
		.from(table.emailConfirm)
		.innerJoin(table.user, eq(table.emailConfirm.userId, table.user.id))
		.where(
			and(
				eq(table.emailConfirm.id, sessionId),
				eq(table.emailConfirm.confirmCode, confirmCodeHash),
			),
		);

	if (!result) {
		return { emailConfirm: null, user: null };
	}
	const { emailConfirm, user } = result;

	if (emailConfirm.for !== EmailConfirmFor.RESET_PASSWORD) await invalidateSession(emailConfirm.id);

	const sessionExpired = Date.now() >= emailConfirm.expiresAt.getTime();
	if (sessionExpired) return { emailConfirm: null, user: null };

	return { emailConfirm, user };
}

export type SessionValidationResult = Awaited<ReturnType<typeof validateSessionToken>>;

export async function invalidateSession(sessionId: string) {
	await db.delete(table.emailConfirm).where(eq(table.emailConfirm.id, sessionId));
}

export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date) {
	event.cookies.set(sessionCookieName, token, {
		expires: expiresAt,
		path: '/',
	});
}

export function deleteSessionTokenCookie(event: RequestEvent) {
	event.cookies.delete(sessionCookieName, {
		path: '/',
	});
}
