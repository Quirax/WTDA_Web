import { AdultContents, ArticleCategory } from '@app';
import { z } from 'zod';

export const formSchema = z.object({
	title: z.string().nonempty('제목을 입력하십시오.'),
	containsAdultContents: z.nativeEnum(AdultContents).default(AdultContents.NORMAL),
	visibleOnlyToCommissioner: z.boolean().default(false),
	budget: z.number().nonnegative('금액은 음수가 될 수 없습니다.').nullable(), // null: 조율 가능
	deadline: z.date().nullable(), // null: 조율 가능
	purpose: z.string().nonempty('사용 목적을 입력하십시오.'),
	isForCommercial: z.boolean().default(false),
	category: z.nativeEnum(ArticleCategory),
	tags: z.string().array().default([]),
	content: z.string(),
	thumbnail: z.string().nullable(),
});

export type FormSchema = typeof formSchema;
