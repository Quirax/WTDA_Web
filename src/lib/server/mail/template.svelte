<svelte:options runes />

<!-- ref: https://github.com/carstenlebek/svelte-email?tab=readme-ov-file -->
<script lang="ts">
	import * as paraglide from '$lib/paraglide/runtime';
	import { footerInfo, isLink } from '$lib/config';

	import st, * as s from './style';

	const anchorProps = {
		class: 'anchor',
		style: st(s.fontWeight('medium'), s.color(s.c.stone_800), s.text_decoration_no_underline),
	};

	const sectionDivProps = {
		style: st(s.leading(7), s.mt(6)),
	};

	const infoSpanProps = {
		style: st(s.mr(4), s.mb(1), s.whitespace_nowrap),
	};

	const { children = () => {} } = $props();
</script>

<html lang={paraglide.languageTag()}>
	<head>
		<meta content="text/html; charset=utf-8" http-equiv="content-type" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<style>
			.im {
				all: initial;
			}

			.anchor + .anchor {
				margin-left: calc(0.25rem * 4);
				margin-top: 0.25rem;
			}

			.anchor:hover {
				color: #753f0b !important;
			}

			.contents {
				margin: 0 auto;
			}

			.p {
				line-height: calc(0.25rem * 7);
			}

			.p + .p {
				margin-top: calc(0.25rem * 6);
			}
		</style>
	</head>
	<body style={st(s.bg(s.t.secondary), s.color(s.c.black), s.textSize('base'))}>
		<div class="contents" style={st(s.w('full'), s.max_w(150), s.bg(s.t.background))}>
			<header style={st(s.bg(s.t.background), s.border_b(2), s.text_center)}>
				<div
					style={st(
						s.relative,
						s.rounded_full,
						s.size(10),
						s.overflow_hidden,
						s.bg(s.c.white),
						s.p(1),
						s.inline_block,
					)}>
					<img
						style={st(s.aspect_square, s.size('full'))}
						alt="뭐하지공방 로고"
						src="
https://drive.google.com/u/0/drive-viewer/AKGpihaE7cMbJ5dg1UQxSJGd7YIpA8q46pva_5HUe7uEiYGjhU4SJNmm6jZ1f1KrwQGV_z4IItqjMahgQF7ph2gNcuyalYgN6tAdGJ4=s1600-rw-v1" />
				</div>
				<div style={st(s.mx(6), s.fontWeight('bold'))}>뭐하지공방</div>
			</header>
			<section style={st(s.p(10))}>
				{@render children()}
			</section>
			<footer style={st(s.p(10), s.textSize('sm'), s.bg(s.c.stone_400), s.color(s.c.stone_800))}>
				<div style={st(s.textSize('base'), s.leading(7))}>
					{#each footerInfo.links as link}
						<a href={link.href} target={link.target} {...anchorProps}>{link.text}</a>
					{/each}
				</div>
				<div {...sectionDivProps}>
					{#each footerInfo.info as info}
						{#if isLink(info.info)}
							<span {...infoSpanProps}>
								{info.subject}:
								<a href={info.info.href} target={info.info.target} {...anchorProps}>
									{info.info.text}
								</a>
							</span>
						{:else}
							<span {...infoSpanProps}>{info.subject}: {info.info}</span>
						{/if}
					{/each}
				</div>
				<div {...sectionDivProps}>
					<span>
						{#each footerInfo.usedDesignBy as by, idx}
							<a href={by.href} target={by.target} {...anchorProps}>{by.text}</a>
							{idx < footerInfo.usedDesignBy.length - 1 ? ',' : ''}
						{/each}
						등에서
					</span>
					디자인한 이미지 요소가 사용되었습니다.
				</div>
				<div {...sectionDivProps}>
					{footerInfo.disclaimar}
				</div>
			</footer>
		</div>
	</body>
</html>
