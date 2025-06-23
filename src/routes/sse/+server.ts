import { listen } from '$lib/server/common/telecom';
import { error, fail } from '@sveltejs/kit';
import { produce } from 'sveltekit-sse';

export const POST = ({ locals }) => {
	let unlisten: () => Promise<void>;

	return produce(
		async ({ emit, lock }) => {
			if (!locals.user) throw error(401);

			unlisten = await listen(locals.user.id, 'sse', (message) => {
				const { error } = emit(message.event || 'message', JSON.stringify(message));

				if (error) {
					console.error(error);
					lock.set(false);
				}
			});
		},
		{
			stop: () => {
				unlisten?.();
			},
		},
	);
};
