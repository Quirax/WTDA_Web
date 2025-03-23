import { z } from 'zod';

export const formSchema = z.object({
	email: z.string().email('잘못된 이메일 주소입니다.'),
	confirmCode: z
		.string()
		.regex(
			/^([A-Z0-9]{5})-([A-Z0-9]{5})$/,
			'인증 코드가 잘못되었습니다. 다시 확인해주시기 바랍니다.',
		),
});

export type FormSchema = typeof formSchema;
