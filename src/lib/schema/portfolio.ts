import { AdultContents, ArticleCategory } from '@app';
import { z } from 'zod';

export const formSchema = z.object({
	title: z.string().nonempty('제목을 입력하십시오.'),
	containsAdultContents: z.nativeEnum(AdultContents).default(AdultContents.NORMAL),
	category: z.nativeEnum(ArticleCategory),
	tags: z.string().array().default([]),
	content: z.string(),
	thumbnail: z.string().nullable(),
	media: z.string().array().default([]),
	publishDate: z.date().nullable(), // null: 공개일 미상
});

export type FormSchema = typeof formSchema;
