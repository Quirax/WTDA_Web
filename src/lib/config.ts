import type { SimpleIcon } from 'simple-icons';
import { siX, siMastodon, siBluesky, siTistory } from 'simple-icons';
import { m } from './messages';

export type Link = {
	href: string;
	target?: string;
	text: string;
};

export function isLink(info: unknown): info is Link {
	return typeof info === 'object';
}

type Info = {
	subject: string;
	info: string | Link;
};

export const footerInfo: {
	links: Link[];
	sns: (Link & { icon: SimpleIcon })[];
	info: Info[];
	usedDesignBy: Link[];
	disclaimar: string;
} = {
	links: [
		{ href: 'https://ofc.whattodo.at/notice', target: '_blank', text: '공지사항' },
		{ href: '/tos', text: m['TOS']() },
		{ href: '/privacy', text: m['PRIVACY_POLICY']() },
	],
	sns: [
		{
			href: 'https://x.com/whattodo_at',
			target: '_blank',
			text: 'X(구 트위터) 공식 계정',
			icon: siX,
		},
		{
			href: 'https://planet.moe/@whattodo_at',
			target: '_blank',
			text: '마스토돈 공식 계정',
			icon: siMastodon,
		},
		{
			href: 'https://bsky.app/profile/whattodo-at.bsky.social',
			target: '_blank',
			text: '블루스카이 공식 계정',
			icon: siBluesky,
		},
		{ href: 'https://ofc.whattodo.at', target: '_blank', text: '공식 블로그', icon: siTistory },
	],
	info: [
		{ subject: '상호', info: '뭐하지공방' },
		{ subject: '대표', info: '홍길동' },
		{ subject: '개인정보관리책임자', info: '홍길동' },
		{ subject: '이메일', info: { href: '.', text: 'support@whattodo.at' } },
	],
	usedDesignBy: [{ href: 'http://www.freepik.com/', target: '_blank', text: 'Freepik' }],
	disclaimar: '이 사이트는 데모용 샘플로, 실제 운영되는 사이트가 아닙니다.',
};

export const emailExpiresIn = 180; // 3 minutes = 180 seconds

// ref: https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types
export const imageFormat = '.apng, .png, .avif, .gif, .jpg, .jpeg, .jpe, .jif, .jfif, .svg, .webp';
export const imageMime = [
	'image/apng', // .apng
	'image/png', // .png
	'image/avif', // .avif
	'image/gif', // .gif
	'image/jpeg', // .jpg, .jpeg, .jpe, .jif, .jfif
	'image/svg+xml', // .svg
	'image/webp', // .webp
];

export const announcementsPerPage = 5;
export const searchResultsPerPage = 10;
export const profileArticlesPerPage = 10;
export const dmsPerPage = 20;

// XXX (여기부터) 알파테스트 전용
export const invitationCodesPerPage = 10;
export const invitationCodeLength = 10;
// XXX (여기까지) 알파테스트 전용
