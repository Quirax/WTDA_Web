import { ArticleCategory, ArticleType } from '@app';
import { z } from 'zod';

export const formSchema = z.object({
	query: z.string(),
	type: z.nativeEnum(ArticleType).array().catch(Object.values(ArticleType)),
	search_range: z.enum(['title', 'content', 'tag']).array().catch(['title', 'content', 'tag']),
	category: z.nativeEnum(ArticleCategory).array().catch(Object.values(ArticleCategory)),
	min_budget: z.number().nonnegative('금액은 음수가 될 수 없습니다.').nullish(),
	max_budget: z.number().nonnegative('금액은 음수가 될 수 없습니다.').nullish(),
	budget_negotiable: z.boolean().catch(false),
	date_start: z.date().nullish(),
	date_end: z.date().nullish(),
	date_negotiable: z.boolean().catch(false),
	commercial_use: z.enum(['all', 'excluded', 'required']).catch('all'),
	adult_contents: z.enum(['all', 'excluded', 'required']).catch('all'),
});

export type FormSchema = typeof formSchema;
