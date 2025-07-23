import { listen } from '$lib/server/common/telecom';
import { error } from '@sveltejs/kit';
import { produce } from 'sveltekit-sse';

export const POST = ({ locals }) => {
	let unlisten: () => Promise<void>;

	return produce(
		async ({ emit, lock }) => {
			if (!locals.user) return;

			unlisten = await listen(locals.user.id, 'sse', (message) => {
				// ref: https://github.com/razshare/sveltekit-sse/issues/47#issuecomment-2371823805
				if (typeof message === 'object') message.ts = Date.now();

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
