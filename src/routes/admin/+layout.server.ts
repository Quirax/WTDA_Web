import { UserRole } from '@app';
import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ locals }) => {
	if (!locals.user || locals.user.role !== UserRole.ADMIN) throw redirect(302, '/'); // 관리자가 아닌 사람은 들어오지 못하도록 제한

	return {};
}) satisfies LayoutServerLoad;
