import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// ref: https://github.com/drizzle-team/drizzle-orm/discussions/1914#discussioncomment-9600199
export function enumToPgEnum<T extends Record<string, any>>(
	enumeration: T,
): [T[keyof T], ...T[keyof T][]] {
	return Object.values(enumeration).map((value: any) => `${value}`) as any;
}
