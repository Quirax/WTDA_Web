import type { RequestHandler } from './$types';
import * as S3 from '$lib/server/aws/s3';
import { error, json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
	const path = params.path;

	try {
		const response = await S3.get(path);

		if (!response.data) throw error(404);

		const body = response.data?.transformToWebStream();

		return new Response(body);
	} catch (error: any) {
		if (error.reason) console.error(error.reason);
		throw error(500, error);
	}
};

export const PUT: RequestHandler = async ({ params, locals, request }) => {
	if (!locals.user) throw error(403);

	const path = params.path;
	const stream = request.body;

	if (!path) throw error(400, { message: 'Requires path' });
	if (!stream) throw error(400, { message: 'Requires stream' });

	try {
		await S3.put(path, stream);

		return json({ message: 'Uploaded successfully ' });
	} catch (error: any) {
		if (error.reason) console.error(error.reason);
		throw error(500, error);
	}
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) throw error(403);

	const path = params.path;

	if (!path) throw error(400, { message: 'Requires path' });

	try {
		await S3.remove(path);

		return json({ message: 'Removed successfully ' });
	} catch (error: any) {
		if (error.reason) console.error(error.reason);
		throw error(500, error);
	}
};
