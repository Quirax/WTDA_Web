import { ArticleType } from '@app';
import type { PageServerLoad } from './$types';
import { formSchema, type FormSchema } from '$lib/schema/search';
import { ZodArray, ZodBoolean, ZodNumber, ZodType, type ZodTypeAny } from 'zod';
import { superValidate, type Infer } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { error } from '@sveltejs/kit';

// ref: https://stackoverflow.com/a/65152869
const isZodType = <T extends ZodTypeAny>(
	constructor: new (...args: any[]) => T,
	candidate: any,
): candidate is T => {
	let check = candidate;
	do {
		if (check instanceof constructor) return true;
		check = check?._def?.innerType;
	} while (check);
	return false;
};

const convertType = <T extends ZodTypeAny>(value: string | null, shape: T) => {
	if (value === null) return null;

	if (isZodType(ZodBoolean, shape)) return value === 'true';
	if (isZodType(ZodNumber, shape)) return parseFloat(value);

	return value;
};

export const load = (async ({ url, untrack, ...rest }) => {
	try {
		// query params
		const params = formSchema.parse(
			Object.fromEntries(
				Object.keys(formSchema.shape).map((v) => [
					v,
					isZodType(ZodArray, Object(formSchema.shape)[v])
						? url.searchParams.get(v) === null // default 처리를 위해 값이 실제로 없는지 확인
							? undefined
							: url.searchParams.getAll(v)
						: convertType(url.searchParams.get(v), Object(formSchema.shape)[v]),
				]),
			),
		) as Infer<FormSchema>;

		console.log('query params', params);

		return {
			params: await superValidate(zod(formSchema), {
				defaults: params,
			}),
		};
	} catch (e) {
		console.error(e);

		return error(500, JSON.stringify(e));
	}
}) satisfies PageServerLoad;
