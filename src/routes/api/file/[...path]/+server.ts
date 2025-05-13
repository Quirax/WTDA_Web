import type { RequestHandler } from './$types';
import * as S3 from '$lib/server/aws/s3';
import { error, json } from '@sveltejs/kit';
import { imageMime } from '$lib/config';

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
	const file = (await request.formData()).get('file') as File;

	if (!path) throw error(400, { message: 'Requires path' });
	if (!file) throw error(400, { message: 'Requires file' });

	/**
	 * 파일 보안 처리
	 * ref: https://maker5587.tistory.com/39
	 **/
	if (file.size > 10 * 1024 * 1024)
		// 스테가노그래피 및 대용량 업로드 공격 방지를 위해 10MB로 파일 크기 제한
		throw error(400, { message: 'File size must be smaller than or equal with 10MiB' });
	if (imageMime.indexOf(file.type) < 0)
		// 위험한 파일 포맷 업로드 방지를 위해 특정 MIME만 허용
		throw error(400, {
			message: 'The MIME type of file must be one of the following: ' + imageMime.join(', '),
		});

	const stream = file.stream();

	try {
		await S3.put(path, stream);

		// TODO: DB를 통해 파일과 소유주 연결

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
		// TODO: 파일의 소유주 검증

		await S3.remove(path);

		return json({ message: 'Removed successfully ' });
	} catch (error: any) {
		if (error.reason) console.error(error.reason);
		throw error(500, error);
	}
};
