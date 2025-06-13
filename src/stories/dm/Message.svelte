<script lang="ts" module>
	export enum Direction {
		RECEIVE = 'RECEIVE',
		SEND = 'SEND',
	}
</script>

<script lang="ts">
	import Muted from '$lib/components/typo/muted.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { Button } from '$lib/components/ui/button';
	import { ArticleTypeText } from '$lib/messages';
	import { cn, formatDatetimeString, getLinkPrefix, sanitizeHTML, twemoji } from '$lib/utils';
	import UserAvatar from '$stories/components/Avatar.svelte';
	import type { EmojiEventHandler } from '$stories/components/EmojiList.svelte';
	import emojiRegex from 'emoji-regex';
	import type { Emoji } from 'emoji-type';
	import { CornerDownRight, SmilePlus } from 'lucide-svelte';
	import PhotoSwipeLightbox from 'photoswipe/lightbox';

	interface Props extends ReturnType<typeof $props> {
		dir: Direction;
		dm: App.DM;
		prev?: App.DM;
		next?: App.DM;
		onScrollToDM?: (id: string) => void;
		onOpenEmojiList?: (
			event: MouseEvent & { currentTarget: EventTarget & HTMLElement },
			onEmoji: EmojiEventHandler,
			option: { autoClose?: boolean; value?: Emoji },
		) => void;
		tabindex?: number;
	}

	const {
		dir,
		dm,
		prev,
		next,
		id,
		tabindex = 0,
		onScrollToDM = () => {},
		onOpenEmojiList = () => {},
	}: Props = $props();

	const sameSenderAsPrev =
		!['join', 'leave'].includes(prev?.type || '') && prev?.sender?.id === dm.sender?.id;
	const sameSenderAsNext =
		!['join', 'leave'].includes(next?.type || '') && next?.sender?.id === dm.sender?.id;

	const dataSource = $state(
		(dm.type === 'general' &&
			dm.attachments?.map((medium, idx) => ({
				src: medium,
				alt: `첨부 이미지 ${idx + 1}`,
				height: 0,
				width: 0,
			}))) ||
			[],
	);

	const onLoadMedia =
		(idx: number) =>
		({ target }: Event) => {
			const tg = target as HTMLImageElement;
			dataSource[idx].height = tg.naturalHeight;
			dataSource[idx].width = tg.naturalWidth;
		};

	let galleryElement = $state<HTMLElement>();

	$effect(() => {
		if (!galleryElement) return;

		const lightbox = new PhotoSwipeLightbox({
			gallery: galleryElement,
			children: 'a',
			pswpModule: () => import('photoswipe'),
		});
		lightbox.init();
	});

	let isFocused = $state(false);
	let isMouseHover = $state(false);

	let articleElement = $state<HTMLElement>();

	$effect(() => {
		if (!articleElement) return;

		// ref: https://ko.javascript.info/focus-blur
		articleElement.tabIndex = tabindex;
		articleElement.addEventListener('focusin', () => (isFocused = true));
		articleElement.addEventListener('focusout', () => (isFocused = false));
		articleElement.addEventListener('mouseenter', () => (isMouseHover = true));
		articleElement.addEventListener('mouseleave', () => (isMouseHover = false));
	});

	const onEmoji: EmojiEventHandler = (emoji) => {
		console.log(emoji); // TODO: 이모티콘 반응 등록
	};
</script>

<article
	bind:this={articleElement}
	class={cn('flex w-full', dir === Direction.SEND && 'flex-row-reverse')}
	{id}>
	{#if dir === Direction.RECEIVE && !['join', 'leave'].includes(dm.type)}
		{#if !sameSenderAsPrev}
			<UserAvatar class="m-2 size-9 flex-none" user={dm.sender} />
		{:else}
			<!-- 이전 사용자와 같은 경우 여백으로 표시-->
			<div class="m-2 size-9 flex-none"></div>
		{/if}
	{/if}
	{#if dm.type === 'general'}
		{@const sentAtString = formatDatetimeString(dm.sentAt)}
		<div class={cn('relative flex flex-col', dir === Direction.SEND ? 'items-end' : 'items-start')}>
			{#if dm.message}
				{#if dm.message.replace(emojiRegex(), '') !== ''}
					<section
						class={cn(
							'relative size-fit p-4 text-left',
							dir === Direction.SEND ? 'bg-primary mr-3' : 'bg-secondary ml-2',
						)}
						use:twemoji>
						{#if dm.relatedMessage}
							<a
								class="bg-secondary relative mb-2 block cursor-pointer space-y-2 border p-2 text-left"
								href="#dm-{dm.relatedMessage.id}"
								onclick={(event) => {
									event.preventDefault(); // 화면 전체 스크롤을 차단
									onScrollToDM(dm.relatedMessage!.id);
								}}
								use:twemoji>
								<div class="flex items-center space-x-2 bg-inherit">
									<UserAvatar class="size-[2em] flex-none" user={dm.relatedMessage.sender} />
									<strong>{dm.relatedMessage.sender?.username}</strong>
									<Muted class="">{formatDatetimeString(dm.relatedMessage.sentAt)}</Muted>
								</div>
								<div class="bg-inherit">
									{@html sanitizeHTML(
										(
											(dm.relatedMessage.type === 'general' && dm.relatedMessage.message) ||
											'<i>내용 없음</i>'
										).replace(/\n/g, '<br>'),
									)}
								</div>
							</a>
						{/if}
						{#if dm.relatedPost}
							{@const href = dm.relatedPost.type
								? `/${getLinkPrefix(dm.relatedPost.type)}/${dm.relatedPost.article.id}`
								: ''}
							<a
								class="bg-secondary relative mb-2 flex cursor-pointer border p-2 text-left"
								{href}
								target="_blank">
								<div class="mr-2 aspect-video h-16">
									{#if dm.relatedPost.article.thumbnail}
										<img
											src={dm.relatedPost.article.thumbnail}
											class="aspect-video h-full object-cover"
											alt="이 의뢰의 썸네일" />
									{:else}
										<div class="banner-pattern bg-primary aspect-video h-full"></div>
									{/if}
								</div>
								<div class="flex flex-col space-y-2">
									<div class="flex items-center space-x-2 bg-inherit">
										<Badge>
											{ArticleTypeText[dm.relatedPost.type]()}
										</Badge>
										<UserAvatar class="size-[2em] flex-none" user={dm.relatedPost.article.author} />
										<strong>{dm.relatedPost.article.author.username}</strong>
									</div>
									<strong class="overflow-hidden text-ellipsis whitespace-nowrap">
										{dm.relatedPost.article.title}
									</strong>
								</div>
							</a>
						{/if}
						{@html sanitizeHTML(dm.message.replace(/\n/g, '<br>'))}
						{#if dm.reactions}
							{@const reactions = Object.entries(dm.reactions)}
							{#if reactions.length > 0}
								<div class="mt-2 space-x-2 text-right">
									{#each reactions as [emoji, num]}
										<Badge
											variant={emoji === dm.myReaction ? 'default' : 'outline'}
											class="space-x-1">
											<span>{emoji}</span>
											<span>{num}</span>
										</Badge>
									{/each}
								</div>
							{/if}
						{/if}
						{#if !sameSenderAsPrev}
							<!-- 이전 사용자와 같은 경우 말풍선 꼬리 미표시 -->
							<div
								class={cn(
									'absolute top-4.5 z-1 size-4 rotate-45',
									dir === Direction.SEND ? 'bg-primary right-[-8px]' : 'bg-secondary left-[-8px]',
								)}>
							</div>
						{/if}
					</section>
				{:else}
					<section
						class={cn('text-left', dir === Direction.SEND ? 'mr-3' : 'ml-2')}
						use:twemoji={{ className: 'emoji large' }}>
						{dm.message}
					</section>
				{/if}
			{/if}
			{#if dataSource.length > 0}
				<div
					bind:this={galleryElement}
					class={cn(
						'pswp-gallery pswp-gallery--single-column grid grid-cols-3 gap-2 border p-2',
						dm.message && 'mt-2',
						dir === Direction.SEND ? 'mr-3' : 'ml-2',
					)}>
					{#each dataSource as img, idx}
						<a
							href={img.src}
							data-pswp-width={img.width}
							data-pswp-height={img.height}
							data-cropped="true"
							target="_blank">
							<img
								src={img.src}
								alt={img.alt}
								onload={onLoadMedia(idx)}
								class="size-30 object-cover" />
						</a>
					{/each}
				</div>
			{/if}
			{#if !sameSenderAsNext || formatDatetimeString(next?.sentAt || new Date(0)) !== sentAtString}
				<!-- 다음 사용자와 같은 경우 보낸 시간 미표시 -->
				<Muted class="mx-3 flex-none">{sentAtString}</Muted>
			{/if}
			<aside
				class={cn(
					'bg-background absolute -bottom-10 z-1 border p-2',
					!(isFocused || isMouseHover) && 'hidden',
					dir === Direction.SEND ? '-left-2' : '-right-2',
				)}>
				<Button size="icon" variant="ghost" class="size-8 border">
					<!-- 답글 -->
					<CornerDownRight />
				</Button>
				<Button
					size="icon"
					variant="ghost"
					class="size-8 border"
					onclick={(event) =>
						onOpenEmojiList(event, onEmoji, { autoClose: true, value: dm.myReaction })}>
					<!-- 이모티콘 반응 -->
					<SmilePlus />
				</Button>
			</aside>
		</div>
	{:else if dm.type === 'join'}
		<Muted class="w-full text-center">{dm.sender?.username} 님이 대화방에 들어왔습니다.</Muted>
	{:else if dm.type === 'leave'}
		<Muted class="w-full text-center">
			{dm.sender?.username} 님이 대화방에서 나갔습니다.
		</Muted>
	{/if}
</article>
