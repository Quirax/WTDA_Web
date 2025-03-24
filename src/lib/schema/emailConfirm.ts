import { z } from 'zod';

export const formSchema = z.object({
	confirmCode: z
		.string()
		.regex(
			/^([A-Z0-9]{5})-([A-Z0-9]{5})$/,
			'인증 코드가 잘못되었습니다. 다시 확인해주시기 바랍니다.',
		),
	email: z.string().email().optional(),
});

export type FormSchema = typeof formSchema;
