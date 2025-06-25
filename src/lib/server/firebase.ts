import admin from 'firebase-admin';
import serviceAccount from '../../../.firebase-admin-credential.json';
import { db, table } from './db';
import { eq } from 'drizzle-orm';

let baseURL = '';

export const setBaseURL = (host: string, protocol: string) => (baseURL = `${protocol}//${host}`);

export const firebaseAdmin =
	admin.app() || // app/duplicate-app 오류 방지
	admin.initializeApp({
		credential: admin.credential.cert({
			projectId: serviceAccount.project_id,
			clientEmail: serviceAccount.client_email,
			privateKey: serviceAccount.private_key,
		}),
	});

// ref: https://yoohyeon.tistory.com/156
// ref: https://firebase.google.com/docs/cloud-messaging/send-message?hl=ko#send-messages-to-multiple-devices
export const sendMessage = async (userId: string, title?: string, body?: string, link?: string) => {
	const tokens =
		(
			await db
				.select({ tokens: table.user.notificationToken })
				.from(table.user)
				.where(eq(table.user.id, userId))
		).at(0)?.tokens || [];

	if (tokens.length === 0) return;

	return await firebaseAdmin.messaging().sendEachForMulticast({
		tokens,
		notification: {
			title,
			body,
		},
		webpush: {
			fcmOptions: {
				link: link && baseURL && new URL(link, baseURL).href,
			},
		},
	});
};
