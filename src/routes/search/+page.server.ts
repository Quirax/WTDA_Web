import { ArticleType } from '@app';
import type { PageServerLoad } from './$types';

const defaultParams: { [key: string]: any } = {};

export const load = (async ({ url }) => {
	// query params
	const params = Object.fromEntries(
		['query', 'type'].map((v) => [v, url.searchParams.get(v) || defaultParams[v]]),
	);

	console.log('query params', params);

	return {};
}) satisfies PageServerLoad;
