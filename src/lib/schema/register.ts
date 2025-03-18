import { z } from 'zod';

export const formSchema = z
	.object({
		username: z.string().min(1, '닉네임이 필요합니다').max(20, '닉네임은 20자를 넘을 수 없습니다.'),
		password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다.'),
		passwordConfirm: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다.'),
		email: z.string().email('잘못된 이메일 주소입니다.'),
		agree_eula: z.boolean().default(false),
		agree_privacypolicy: z.boolean().default(false),
		agree_marketing: z.boolean().default(false),
	})
	.refine((data) => data.password === data.passwordConfirm, {
		message: '비밀번호가 일치하지 않습니다.',
		path: ['passwordConfirm'],
	})
	.refine((data) => data.agree_eula, {
		message: '이용약관에 동의해야 가입할 수 있습니다.',
		path: ['agree_eula'],
	})
	.refine((data) => data.agree_privacypolicy, {
		message: '개인정보처리방침에 동의해야 가입할 수 있습니다.',
		path: ['agree_privacypolicy'],
	});

export type FormSchema = typeof formSchema;
