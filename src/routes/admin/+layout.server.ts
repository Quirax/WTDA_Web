import { UserRole } from '@app';
import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ locals, cookies, url }) => {
	if (!locals.user || locals.user.role !== UserRole.ADMIN) throw redirect(302, '/'); // 관리자가 아닌 사람은 들어오지 못하도록 제한

	const adminToken = cookies.get(_adminCookie);

	if (!adminToken) {
		if (url.pathname !== '/admin/auth') throw redirect(302, '/admin/auth'); // 관리자 비밀번호 확인을 거치도록 강제
	} else {
		cookies.set(_adminCookie, adminToken, {
			expires: new Date(Date.now() + 10 * 60 * 1000),
			path: '/admin',
		});
	}

	return {};
}) satisfies LayoutServerLoad;

export const _adminCookie = 'admin';
