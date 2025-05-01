import { ArticleType } from '@app';
import type { PageServerLoad } from './$types';
import { formSchema, type FormSchema } from '$lib/schema/search';
import { ZodArray, type ZodTypeAny } from 'zod';
import { superValidate, type Infer } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

const isZodArray = (candidate: any): candidate is ZodArray<ZodTypeAny> => {
	let check = candidate;
	do {
		if (check instanceof ZodArray) return true;
		check = check?._def?.innerType;
	} while (check);
	return false;
};

export const load = (async ({ url }) => {
	// query params
	const params = Object.fromEntries(
		Object.keys(formSchema.shape).map((v) => [
			v,
			Object(formSchema.shape)[v].parse(
				isZodArray(Object(formSchema.shape)[v])
					? url.searchParams.get(v) === null // default 처리를 위해 값이 실제로 없는지 확인
						? undefined
						: url.searchParams.getAll(v)
					: url.searchParams.get(v),
			),
		]),
	) as Infer<FormSchema>;

	console.log('query params', params);

	return {
		query: params.query,
		params: await superValidate(zod(formSchema), {
			defaults: params,
		}),
	};
}) satisfies PageServerLoad;
