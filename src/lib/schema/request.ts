import { ArticleCategory } from '@app';
import { z } from 'zod';

export const formSchema = z.object({
	title: z.string().nonempty(),
	containsAdultContents: z.boolean().default(false),
	visibleOnlyToCommissioner: z.boolean().default(false),
	budget: z.number().nonnegative().nullable(), // null: 조율 가능
	deadline: z.date().nullable(), // null: 조율 가능
	purpose: z.string().nonempty(),
	isForCommercial: z.boolean().default(false),
	category: z.nativeEnum(ArticleCategory),
	tags: z.string().array().default([]),
	content: z.string(),
	thumbnail: z.string().nullable(),
});

export type FormSchema = typeof formSchema;
