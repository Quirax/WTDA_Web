import { browser } from '$app/environment';
import { z } from 'zod';

const formObject = z.object({
	username: z.string().min(1, '닉네임이 필요합니다').max(20, '닉네임은 20자를 넘을 수 없습니다.'),
	password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다.'),
	passwordConfirm: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다.'),
	email: z.string().email('잘못된 이메일 주소입니다.'),
	agree_eula: z.boolean().default(false),
	agree_privacypolicy: z.boolean().default(false),
	agree_marketing: z.boolean().default(false),
});

const userObject = z.object({
	password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다.').optional(),
	passwordConfirm: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다.').optional(),
	username: z.string().min(1, '닉네임이 필요합니다').max(20, '닉네임은 20자를 넘을 수 없습니다.'),
	profileImage: z.string().url().nullish(), // ref: https://gist.github.com/ciiqr/ee19e9ff3bb603f8c42b00f5ad8c551e
});

const passwordConfirm = {
	pred: (data: typeof formObject._type | typeof userObject._type) =>
		data.password === data.passwordConfirm,
	error: {
		message: '비밀번호가 일치하지 않습니다.',
		path: ['passwordConfirm'],
	},
};

const uniqueUsername = {
	pred: async ({ username }: typeof formObject._type | typeof userObject._type) => {
		if (!browser) return true;

		const formData = new FormData();
		formData.append('username', username);

		const result = await fetch('?/usernameIsUnique', { method: 'post', body: formData });

		const { status } = await result.json();
		return status === 200; // OK
	},
	error: {
		message: '해당 닉네임은 이미 사용중입니다. 다른 닉네임을 입력하십시오.',
		path: ['username'],
	},
};

export const formSchema = formObject
	.refine(
		async ({ email }) => {
			if (!browser) return true;

			const formData = new FormData();
			formData.append('email', email);

			const result = await fetch('?/emailIsUnique', { method: 'post', body: formData });

			const { status } = await result.json();
			return status === 200; // OK
		},
		{
			message: '해당 이메일은 이미 사용중입니다. 다른 이메일을 입력하십시오.',
			path: ['email'],
		},
	)
	.refine(passwordConfirm.pred, passwordConfirm.error)
	.refine(uniqueUsername.pred, uniqueUsername.error)
	.refine((data) => data.agree_eula, {
		message: '이용약관에 동의해야 가입할 수 있습니다.',
		path: ['agree_eula'],
	})
	.refine((data) => data.agree_privacypolicy, {
		message: '개인정보처리방침에 동의해야 가입할 수 있습니다.',
		path: ['agree_privacypolicy'],
	});

export type FormSchema = typeof formSchema;

export const userSchema = userObject
	.refine(passwordConfirm.pred, passwordConfirm.error)
	.refine(uniqueUsername.pred, uniqueUsername.error);

export type UserSchema = typeof userSchema;

export const passwordSchema = z.object({
	password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다.'),
});

export type PasswordSchema = typeof passwordSchema;
