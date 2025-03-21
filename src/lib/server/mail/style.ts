const st = (...args: string[]) => args.join(' ');

export const c = {
	white: 'white',
	black: 'black',
	stone_100: '#fafaf9',
	stone_400: '#a8a29e',
	stone_800: '#292524',
	primary: '#753f0b',
};

export const t = {
	background: c.white,
	secondary: c.stone_100,
	border: c.stone_400,
	primary: c.primary,
};

export type Size =
	| 'xs'
	| 'sm'
	| 'base'
	| 'lg'
	| 'xl'
	| '2xl'
	| '3xl'
	| '4xl'
	| '5xl'
	| '6xl'
	| '7xl'
	| '8xl'
	| '9xl';

type None = 'none';

type Full = 'full';

const _textSize = {
	xs: '0.75rem',
	sm: '0.875rem',
	base: '1rem',
	lg: '1.125rem',
	xl: '1.25rem',
	'2xl': '1.5rem',
	'3xl': '1.875rem',
	'4xl': '2.25rem',
	'5xl': '3rem',
	'6xl': '3.75rem',
	'7xl': '4.5rem',
	'8xl': '6rem',
	'9xl': '8rem',
};

const _lineHeight = {
	xs: 'calc(1 / 0.75)',
	sm: 'calc(1.25 / 0.875)',
	base: 'calc(1.5 / 1)',
	lg: 'calc(1.75 / 1.125)',
	xl: 'calc(1.75 / 1.25)',
	'2xl': 'calc(2 / 1.5)',
	'3xl': 'calc(2.25 / 1.875)',
	'4xl': 'calc(2.5 / 2.25)',
	'5xl': 1,
	'6xl': 1,
	'7xl': 1,
	'8xl': 1,
	'9xl': 1,
};

export type Weight = 'medium' | 'bold' | 500 | 700;

const _fontWeight = {
	medium: 500,
	bold: 700,
};

const _spacing = '0.25rem';
const _text_sm = '0.875rem';
const _text_sm_line_height = 'calc(1.25 / 0.875)';

const tw_border_style = 'solid';

export const border_b = (px = 1) => `border-bottom: ${px}px ${tw_border_style} ${t.border};`;

export const rounded_full = 'border-radius: calc(infinity * 1px);';

export const overflow_hidden = 'overflow: hidden;';

export const aspect_square = 'aspect-ratio: 1 / 1;';

export const whitespace_nowrap = `white-space: nowrap;`;

/* background */
export const bg = (color: string) => `background-color: ${color};`;

/* display */
export const contents = 'display: contents;';
export const inline_block = 'display: inline-block;';

/* sizing */
export const h = (sp: number | string | Full) =>
	typeof sp === 'number'
		? `height: calc(${_spacing} * ${sp});`
		: sp === 'full'
			? `height: 100%;`
			: `height: ${sp};`;
export const w = (sp: number | string | Full) =>
	typeof sp === 'number'
		? `width: calc(${_spacing} * ${sp});`
		: sp === 'full'
			? `width: 100%;`
			: `width: ${sp};`;
export const max_w = (sp: number | string | Full) =>
	typeof sp === 'number'
		? `max-width: calc(${_spacing} * ${sp});`
		: sp === 'full'
			? `max-width: 100%;`
			: `max-width: ${sp};`;
export const size = (sp: number | string | Full) => st(h(sp), w(sp));

/* margin */
export const mt = (sp: number) => `margin-top: calc(${_spacing} * ${sp});`;
export const ml = (sp: number) => `margin-left: calc(${_spacing} * ${sp});`;
export const mr = (sp: number) => `margin-right: calc(${_spacing} * ${sp});`;
export const mb = (sp: number) => `margin-bottom: calc(${_spacing} * ${sp});`;
export const mx = (sp: number) => st(ml(sp), mr(sp));

/* padding */
export const pl = (sp: number) => `padding-left: calc(${_spacing} * ${sp});`;
export const pr = (sp: number) => `padding-right: calc(${_spacing} * ${sp});`;
export const px = (sp: number) => st(pl(sp), pr(sp));
export const p = (sp: number) => `padding: calc(${_spacing} * ${sp});`;

/* position */
export const relative = 'position: relative;';

/* text */
export const color = (value: string) => `color: ${value};`;
export const textSize = (size: Size | number) =>
	typeof size === 'number'
		? `font-size: ${size}px;`
		: `font-size: ${_textSize[size]}; line-height: ${_lineHeight[size]};`;
export const text_center = 'text-align: center;';
export const leading = (sp: number | None) =>
	typeof sp === 'number' ? `line-height: calc(${_spacing} * ${sp});` : `line-height: 1;`;
export const fontWeight = (weight: Weight) =>
	typeof weight === 'number' ? `font-weight: ${weight}` : `font-weight: ${_fontWeight[weight]};`;
export const text_decoration_no_underline = `text-decoration-line: none;`;

export default st;
