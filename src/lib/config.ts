import type { SimpleIcon } from 'simple-icons';
import { siX, siMastodon, siBluesky } from 'simple-icons';

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
		{ href: '.', text: '공지사항' },
		{ href: '.', text: '고객센터' },
		{ href: '.', text: '이용약관' },
		{ href: '.', text: '개인정보처리방침' },
	],
	sns: [
		{ href: '.', text: 'X(구 트위터) 공식 계정', icon: siX },
		{ href: '.', text: '마스토돈 공식 계정', icon: siMastodon },
		{ href: '.', text: '블루스카이 공식 계정', icon: siBluesky },
	],
	info: [
		{ subject: '상호', info: '뭐하지공방' },
		{ subject: '대표', info: '홍길동' },
		{ subject: '개인정보관리책임자', info: '홍길동' },
		{ subject: '사업자등록번호', info: { href: '.', text: '123-45-67890' } },
		{ subject: '통신판매업신고', info: '2025-경기남양주-1234' },
		{ subject: '주소', info: '경기도 남양주시 호평로68번길 21' },
		{ subject: '이메일', info: { href: '.', text: 'support@whattodo.at' } },
		{ subject: '전화', info: '031-1234-5678' },
	],
	usedDesignBy: [{ href: 'http://www.freepik.com/', target: '_blank', text: 'Freepik' }],
	disclaimar:
		'뭐하지공방은 통신판매중개자이며, 통신판매의 당사자가 아닙니다. 상품, 상품정보, 거래에 관한 의무와 책임은 계약 당사자 각자에게 있습니다.',
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
