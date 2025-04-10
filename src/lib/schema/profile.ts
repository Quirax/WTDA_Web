import { z } from 'zod';
import { uniqueUsername } from './userInfo';

export const profileSchema = z
	.object({
		username: z
			.string()
			.nonempty('닉네임이 필요합니다')
			.max(20, '닉네임은 20자를 넘을 수 없습니다.'),
		profileImage: z.string().url().or(z.string().length(0)).nullish(), // ref: https://gist.github.com/ciiqr/ee19e9ff3bb603f8c42b00f5ad8c551e
		headerImage: z.string().url().or(z.string().length(0)).nullish(),
		introduction: z.string().optional(),
		contactAvailable: z
			.boolean()
			.or(
				z.object({
					from: z
						.number()
						.min(0)
						.max(23)
						.transform((from) => from as NumberEnumerate<24>),
					to: z
						.number()
						.min(0)
						.max(23)
						.transform((from) => from as NumberEnumerate<24>),
				}),
			)
			.nullish()
			.default(false),
		links: z
			.array(
				z.object({
					href: z.string(),
					text: z.string(),
				}),
			)
			.nullish(),
		accentColor: z
			.string()
			.regex(/^#(?:(?:[\da-f]{3}){1,2}|(?:[\da-f]{4}){1,2})$/i, '') // ref: https://stackoverflow.com/a/53330328
			.optional(),
	})
	.refine(uniqueUsername.pred, uniqueUsername.error)
	.refine(
		({ contactAvailable }) =>
			!contactAvailable ||
			typeof contactAvailable !== 'object' ||
			contactAvailable.from <= contactAvailable.to,
		{
			message: '시작 시간은 종료 시간보다 이르거나 같아야 합니다.',
			path: ['contactAvailable'],
		},
	)
	.refine(
		({ links }) =>
			!links ||
			[...links].reduce((acc, cur, i, arr) => {
				if (cur.href.length === 0 || cur.text.length === 0) {
					arr.splice(i);
					return false;
				}

				try {
					new URL(cur.href);
				} catch (e) {
					arr.splice(i);
					return false;
				}

				return acc;
			}, true),
		{
			message: '표시 명칭과 URL을 빠짐없이 입력하시고, 정확한 URL인지 확인해주십시오.',
			path: ['links'],
		},
	);

export type ProfileSchema = typeof profileSchema;
