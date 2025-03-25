import { z } from 'zod';

export const formSchema = z.object({
	email: z.string().email('잘못된 이메일 주소입니다.'),
	password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다.'),
});

export type FormSchema = typeof formSchema;

export const passwordSchema = z
	.object({
		password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다.'),
		passwordConfirm: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다.'),
	})
	.refine((data) => data.password === data.passwordConfirm, {
		message: '비밀번호가 일치하지 않습니다.',
		path: ['passwordConfirm'],
	});

export type PasswordSchema = typeof passwordSchema;
