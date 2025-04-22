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
	//     thumbnail: text('thumbnail'),
	//     category: articleCategory().notNull(),
	//     tags: text('tags')
	//         .array()
	//         .notNull()
	//         .default(sql`'{}'::text[]`),
	//     content: text('content').notNull().default(''),
});

export type FormSchema = typeof formSchema;
