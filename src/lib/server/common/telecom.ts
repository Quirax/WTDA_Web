import { db } from '../db';

export type Callback = (message: any) => void;

const listening: Record<string, () => Promise<void>> = {};

export const listen = async (userId: string, key: string, cb: Callback) => {
	const name = `${userId}_${key}`;

	if (listening[name] !== undefined) listening[name]();

	listening[name] = (
		await db.$client.listen(userId, (notification: string) => {
			const message = JSON.parse(notification);

			cb(message);
		})
	).unlisten;

	return listening[name];
};

export const notify = async (targetId: string, message: any) =>
	await db.$client.notify(targetId, JSON.stringify(message));
