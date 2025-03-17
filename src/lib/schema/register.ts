import { z } from 'zod';

export const formSchema = z.object({
	username: z.string().max(20),
	password: z.string(),
	confirm_password: z.string(),
	email: z.string().email(),
	agree_eula: z.boolean().default(true),
	agree_privacypolicy: z.boolean().default(true),
	agree_marketing: z.boolean().default(true),
});

export type FormSchema = typeof formSchema;
