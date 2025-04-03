import { type ClassValue, clsx } from 'clsx';
import { date } from 'drizzle-orm/mysql-core';
import { MediaQuery } from 'svelte/reactivity';
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

const Min2Ms = 60 * 1000;

const DurationStringConditions = Object.freeze([
	{ maxDuration: Min2Ms, output: () => `1분 미만` },
	{ maxDuration: 60 * Min2Ms, output: (time: number) => `약 ${time}분` },
	{ maxDuration: 24 * 60 * Min2Ms, output: (time: number) => `약 ${time}시간` },
	{
		maxDuration: 30 * 24 * 60 * Min2Ms,
		output: (time: number) => `약 ${time}일`,
	},
	{
		maxDuration: 12 * 30 * 24 * 60 * Min2Ms,
		output: (time: number) => `약 ${time}개월`,
	},
	{
		maxDuration: undefined,
		output: (time: number) => `약 ${time}년`,
	},
]);

// ref: https://inpa.tistory.com/entry/JS-%F0%9F%9A%80-reduce-break-%ED%95%98%EB%8A%94-%EB%B2%95-How-to-early-break-reduce
export function durationString(ms: number) {
	return DurationStringConditions.slice(0).reduce((_, cur, i, arr) => {
		if (!cur.maxDuration || ms < cur.maxDuration) {
			const minDuration = i === 0 ? 0 : arr[i - 1].maxDuration!;
			arr.splice(1);
			if (minDuration > 0) return cur.output(Math.ceil(ms / minDuration));
			else return cur.output(0);
		}

		return '';
	}, '');
}

export function formatDateString(date: Date) {
	return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}.`;
}

export function formatTimeString(time: Date) {
	return `${time.getHours() >= 12 ? '오후' : '오전'} ${time.getHours() % 12 || 12}:${time.getMinutes().toString().padStart(2, '0')}`;
}

export function formatDatetimeString(datetime: Date) {
	return `${formatDateString(datetime)} ${formatTimeString(datetime)}`;
}

export function getValueFromResponseData(data: any[], field: string) {
	const fieldDict = data[0];

	if (!fieldDict[field]) return undefined;

	return data[fieldDict[field]];
}

export function isDesktop() {
	const isDesktop = new MediaQuery('(min-width: 768px)');

	return isDesktop.current;
}
