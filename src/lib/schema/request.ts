import { z } from 'zod';

export const formSchema = z.object({
	title: z.string().nonempty(),
	containsAdultContents: z.boolean().default(false),
	visibleOnlyToCommissioner: z.boolean().default(false),
	budget: z.number().nonnegative().nullable(), // null: 조율 가능
	deadline: z.date().nullable(), // null: 조율 가능
	//     thumbnail: text('thumbnail'),
	//     category: articleCategory().notNull(),
	//     tags: text('tags')
	//         .array()
	//         .notNull()
	//         .default(sql`'{}'::text[]`),
	//     content: text('content').notNull().default(''),
	//         isForCommercial: boolean().notNull().default(false),
	//         purpose: text('purpose').notNull(),
});

export type FormSchema = typeof formSchema;
