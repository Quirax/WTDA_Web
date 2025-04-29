import type { PageServerLoad } from './$types';

export const load = (async ({ url }) => {
	// query params
	const params = Object.fromEntries(['query'].map((v) => [v, url.searchParams.get(v)]));

	console.log('query params', params);

	return {};
}) satisfies PageServerLoad;
