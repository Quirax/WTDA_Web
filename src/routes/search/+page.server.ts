import { ArticleType } from '@app';
import type { PageServerLoad } from './$types';
import { formSchema, type FormSchema } from '$lib/schema/search';
import { ZodArray, ZodBoolean, ZodDate, ZodNumber, ZodObject, ZodType, type ZodTypeAny } from 'zod';
import { superValidate, type Infer } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { error, fail } from '@sveltejs/kit';
import {
	and,
	arrayContains,
	desc,
	eq,
	gte,
	ilike,
	isNotNull,
	isNull,
	lte,
	ne,
	or,
	sql,
	type TableConfig,
} from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { union, unionAll } from 'drizzle-orm/pg-core';
import { allArticles } from '$lib/server/db/shorthands';
import { searchResultsPerPage } from '$lib/config';

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
			case 'username':
				return ilike(table.user.username, `%${params.query.replace(/%/g, '%%')}%`);
		}
	});
	if (searchRange.length > 0) criteria.push(or(...searchRange));

	const category = params.category.map((v) => eq(t.category, v));
	if (category.length > 0) criteria.push(or(...category));

	if (budgetColumn) {
		const budget = [];
		if (params.min_budget) budget.push(gte(budgetColumn, params.min_budget));
		if (params.max_budget) budget.push(lte(budgetColumn, params.max_budget));
		if (budget.length > 0) {
			if (params.budget_negotiable) criteria.push(or(and(...budget), isNull(budgetColumn)));
			else criteria.push(and(...budget));
		} else if (!params.budget_negotiable) criteria.push(isNotNull(budgetColumn));
	}

	if (dateColumn) {
		const date = [];
		if (params.date_start) date.push(gte(dateColumn, params.date_start));
		if (params.date_end) date.push(lte(dateColumn, params.date_end));
		if (date.length > 0) {
			if (params.date_negotiable) criteria.push(or(and(...date), isNull(dateColumn)));
			else criteria.push(and(...date));
		} else if (!params.date_negotiable) criteria.push(isNotNull(dateColumn));
	}

	if (params.commercial_use === 'excluded') criteria.push(ne(t.isForCommercial, true));
	else if (params.commercial_use === 'required') criteria.push(eq(t.isForCommercial, true));

	if (params.adult_contents === 'excluded') criteria.push(ne(t.containsAdultContents, true));
	else if (params.adult_contents === 'required') criteria.push(eq(t.containsAdultContents, true));

	return and(...criteria);
};

export const load = (async ({ url, untrack, ...rest }) => {
	const page = parseInt(url.searchParams.get('page') || '1');

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

	let articles: (App.Articles & { modifyDate: Date })[] = [];
	let count = 0;

	if (parsed.success) {
		try {
			const all = allArticles(parsed.data.type, {
				request: createCriteria(parsed.data, table.commissionRequest, {
					budgetColumn: table.commissionRequest.budget,
					dateColumn: table.commissionRequest.deadline,
				}),
			});

			if (all) count = await db.$count(all);

			articles =
				(await all
					?.orderBy(desc(table.commissionRequest.createDate))
					.limit(searchResultsPerPage)
					.offset(searchResultsPerPage * (page - 1))) || [];
		} catch (e) {
			console.error(e);
			return error(500, { message: 'An error has occurred' });
		}
	}

	return {
		query: params.query,
		params: await superValidate(zod(formSchema), {
			defaults: parsed.data || params,
		}),
		error: JSON.stringify(parsed.error),
		articles,
		count,
		page,
	};
}) satisfies PageServerLoad;
