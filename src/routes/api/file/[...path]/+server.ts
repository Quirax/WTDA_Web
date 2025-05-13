import type { RequestHandler } from './$types';
import * as S3 from '$lib/server/aws/s3';
import { error, json } from '@sveltejs/kit';
import { imageMime } from '$lib/config';
import { join as pathJoin } from 'node:path';
import { generateID } from '$lib/server/db';

export const GET: RequestHandler = async ({ params }) => {
	const path = params.path;

	try {
		const response = await S3.get(path);

		if (!response.data) throw error(404);

		const body = response.data?.transformToWebStream();

		return new Response(body);
	} catch (err: any) {
		if (err.reason) console.error(err.reason);
		throw error(500, err);
	}
};

export const PUT: RequestHandler = async ({ params, locals, request }) => {
	if (!locals.user) throw error(403);

	const path = pathJoin(params.path, generateID());
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
	if (!imageMime.includes(file.type))
		// 위험한 파일 포맷 업로드 방지를 위해 특정 MIME만 허용
		throw error(400, {
			message: 'The MIME type of file must be one of the following: ' + imageMime.join(', '),
		});

	const stream = new Uint8Array(await file.arrayBuffer());

	try {
		await S3.put(path, stream);

		// TODO: DB를 통해 파일과 소유주 연결

		return json({ message: 'Uploaded successfully', path });
	} catch (err: any) {
		if (err.reason) console.error(err.reason);
		throw error(500, err);
	}
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) throw error(403);

	const path = params.path;

	if (!path) throw error(400, { message: 'Requires path' });

	try {
		// TODO: 파일의 소유주 검증

		await S3.remove(path);

		// TODO: 파일 등록 해제

		return json({ message: 'Removed successfully ' });
	} catch (err: any) {
		if (err.reason) console.error(err.reason);
		throw error(500, err);
	}
};
