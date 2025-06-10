import type { LayoutServerLoad } from './$types';

export const load = (async ({ params }) => {
	return {
		id: params.id,
	};
}) satisfies LayoutServerLoad;
