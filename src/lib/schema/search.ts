import { ArticleCategory, ArticleType, SearchFlagValues, SearchRangeValues } from '@app';
import { z } from 'zod';

export const formSchema = z
	.object({
		query: z.string(),
		type: z.nativeEnum(ArticleType).array().catch(Object.values(ArticleType)),
		search_range: z
			.enum(SearchRangeValues)
			.array()
			.catch(Array(...SearchRangeValues)),
		category: z.nativeEnum(ArticleCategory).array().catch(Object.values(ArticleCategory)),
		min_budget: z.number().nonnegative('금액은 음수가 될 수 없습니다.').nullish(),
		max_budget: z.number().nonnegative('금액은 음수가 될 수 없습니다.').nullish(),
		budget_negotiable: z.boolean().catch(true),
		date_start: z.date().nullable(),
		date_end: z.date().nullable(),
		date_negotiable: z.boolean().catch(true),
		commercial_use: z.enum(SearchFlagValues).catch('all'),
		adult_contents: z.enum(SearchFlagValues).catch('all'),
	})
	.superRefine(({ min_budget, max_budget }, { addIssue }) => {
		if (!min_budget || !max_budget || min_budget <= max_budget) return true;
		addIssue({
			code: z.ZodIssueCode.custom,
			message: '최소 금액은 최대 금액보다 클 수 없습니다',
			path: ['min_budget'],
		});
		addIssue({
			code: z.ZodIssueCode.custom,
			message: '최소 금액은 최대 금액보다 클 수 없습니다',
			path: ['max_budget'],
		});
		return false;
	})
	.superRefine(({ date_start, date_end }, { addIssue }) => {
		if (!date_start || !date_end || date_start <= date_end) return true;
		addIssue({
			code: z.ZodIssueCode.custom,
			message: '시작 날짜는 끝 날짜보다 클 수 없습니다',
			path: ['date_start'],
		});
		addIssue({
			code: z.ZodIssueCode.custom,
			message: '시작 날짜는 끝 날짜보다 클 수 없습니다',
			path: ['date_end'],
		});
		return false;
	});

export type FormSchema = typeof formSchema;
