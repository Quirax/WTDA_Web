import { ArticleType } from '@app';
import type { PageServerLoad } from './$types';
import { formSchema, type FormSchema } from '$lib/schema/search';
import { ZodArray, ZodBoolean, ZodDate, ZodNumber, ZodObject, ZodType, type ZodTypeAny } from 'zod';
import { superValidate, type Infer } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { error } from '@sveltejs/kit';
import {
	and,
	arrayContains,
	eq,
	gte,
	ilike,
	isNull,
	lte,
	ne,
	or,
	type TableConfig,
} from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import type { PgTable, PgTableWithColumns } from 'drizzle-orm/pg-core';

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
	if (isZodType(ZodNumber, shape)) return value === '' ? null : parseFloat(value);
	if (isZodType(ZodDate, shape)) return value === '' ? null : new Date(value);

	return value;
};

const getSchema = <T extends ZodTypeAny>(schema: T) => {
	let check = schema;
	do {
		if (check instanceof ZodObject) return check.shape;
		check = check?._def?.schema;
	} while (check);
	return undefined;
};

const createCriteria = (
	params: Infer<FormSchema>,
	t: typeof table.commissionRequest,
	{
		budgetColumn,
		dateColumn,
	}: {
		budgetColumn?: typeof table.commissionRequest.budget;
		dateColumn?: typeof table.commissionRequest.deadline;
	},
) => {
	const criteria = [];

	const searchRange = params.search_range.map((v) => {
		switch (v) {
			case 'title':
				return ilike(t.title, `%${params.query.replace(/%/g, '%%')}%`);
			case 'content':
				return ilike(t.content, `%${params.query.replace(/%/g, '%%')}%`);
			case 'tag':
				return arrayContains(t.tags, [params.query]);
		}
	});
	if (searchRange.length > 0) criteria.push(or(...searchRange));

	const category = params.category.map((v) => eq(t.category, v));
	if (category.length > 0) criteria.push(or(...category));

	if (budgetColumn) {
		const budget = [];
		if (params.min_budget) budget.push(gte(budgetColumn, params.min_budget));
		if (params.max_budget) budget.push(lte(budgetColumn, params.max_budget));
		if (params.budget_negotiable) criteria.push(or(and(...budget), isNull(budgetColumn)));
		else criteria.push(and(...budget));
	}

	if (dateColumn) {
		const date = [];
		if (params.date_start) date.push(gte(dateColumn, params.date_start));
		if (params.date_end) date.push(lte(dateColumn, params.date_end));
		if (params.date_negotiable) criteria.push(or(and(...date), isNull(dateColumn)));
		else criteria.push(and(...date));
	}

	if (params.commercial_use === 'excluded') criteria.push(ne(t.isForCommercial, true));
	else if (params.commercial_use === 'required') criteria.push(eq(t.isForCommercial, true));

	if (params.adult_contents === 'excluded') criteria.push(ne(t.containsAdultContents, true));
	else if (params.adult_contents === 'required') criteria.push(eq(t.containsAdultContents, true));

	return and(...criteria);
};

export const load = (async ({ url, untrack, ...rest }) => {
	// query params
	const params = Object.fromEntries(
		Object.keys(getSchema(formSchema)).map((v) => [
			v,
			isZodType(ZodArray, Object(getSchema(formSchema))[v])
				? url.searchParams.get(v) === null // default 처리를 위해 값이 실제로 없는지 확인
					? undefined
					: url.searchParams.getAll(v)
				: convertType(url.searchParams.get(v), Object(getSchema(formSchema))[v]),
		]),
	) as Infer<FormSchema>;

	const parsed = formSchema.safeParse(params);

	if (parsed.success) {
		// create queries
		console.log(
			createCriteria(parsed.data, table.commissionRequest, {
				budgetColumn: table.commissionRequest.budget,
				dateColumn: table.commissionRequest.deadline,
			}),
		);
	}

	return {
		params: await superValidate(zod(formSchema), {
			defaults: params,
		}),
		error: JSON.stringify(parsed.error),
	};
}) satisfies PageServerLoad;
