<script lang="ts">
	import H2 from '$lib/components/typo/h2.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Header from '$stories/components/Header.svelte';
	import Section from '$stories/components/Section.svelte';
	import { Paperclip, SendHorizontal, SmilePlus, X } from 'lucide-svelte';
	import Message, { Direction } from './Message.svelte';
	import { userStore } from '$lib/context';
	import { ArticleCategory, ArticleType } from '@app';
	import EmojiList, { type EmojiEventHandler } from '$stories/components/EmojiList.svelte';
	import { onNavigate } from '$app/navigation';
	import type { Emoji } from 'emoji-type';
	import { formatDatetimeString, sanitizeHTML, twemoji } from '$lib/utils';
	import Muted from '$lib/components/typo/muted.svelte';
	import UserAvatar from '$stories/components/Avatar.svelte';
	import MediaListCarousel from '$stories/components/MediaListCarousel.svelte';
	import * as Card from '$lib/components/ui/card';

	interface Props extends ReturnType<typeof $props> {}

	const {}: Props = $props();

	let user = $state<App.User>(null);
	userStore.subscribe((v) => (user = v));

	const dms = $derived<App.DM[]>([
		{
			id: 'asdf',
			type: 'join',
			sender: user,
			sentAt: new Date(1000000),
		},
		{
			id: '1234',
			type: 'general',
			sender: user,
			sentAt: new Date(1100000),
			relatedPost: {
				type: ArticleType.REQUEST,
				article: {
					thumbnail:
						'https://media.planet.moe/cache/media_attachments/files/114/667/992/480/752/949/original/482dbc6092f63524.jpeg',
					title: '없는 게시물',
					author: user!,
					category: ArticleCategory.TEXT,
					tags: [],
					id: 'asdf',
				},
			},
		},
		{
			id: 'asdf',
			type: 'general',
			sender: user,
			sentAt: new Date(1100000),
			message: '이모티콘 테스트: 😂👨‍🦳✨🎂✈️💓',
			reactions: {
				'🤪': 1,
				'😵': 1,
			},
		},
		{
			id: 'asdf',
			type: 'general',
			sender: user,
			sentAt: new Date(1100000),
			message: '😂👨‍🦳✨🎂✈️💓',
		},
		{
			id: 'asdf',
			type: 'general',
			sender: user,
			sentAt: new Date(1200000),
			message: '장문의 기이이이이이이이다란 텍스트 메시지를 테스트해봅니다',
		},
		{
			id: 'asdf',
			type: 'general',
			sender: user,
			sentAt: new Date(1200000),
			message: '장문의 기이이이이이이이다란\n텍스트 메시지를 테스트해봅니다',
			reactions: {
				'🤪': 1,
				'😵': 1,
			},
			myReaction: '😵',
		},
		{
			id: 'asdf',
			type: 'general',
			sender: user,
			sentAt: new Date(1200000),
			// message: '이미지 테스트',
			attachments: [
				'https://pbs.twimg.com/media/Gs_3JaFaMAA8kCN.jpg?name=orig',
				'https://pbs.twimg.com/media/GtKU7MibMAMZzo5.jpg?name=orig',
				'https://pbs.twimg.com/media/GtLOOpLbMAMp2Mw.jpg?name=orig',
				'https://pbs.twimg.com/media/GtLQhrjbgAEz0HO.jpg?name=orig',
				// 'https://pbs.twimg.com/media/GtIqoRvbMAAOYSm.jpg?name=orig',
				// 'https://pbs.twimg.com/media/Gs_CdezaQAAL7iT.jpg?name=orig',
				// 'https://pbs.twimg.com/media/GtA7WbyWIAAvEck.jpg?name=orig',
				// 'https://pbs.twimg.com/media/GtFI0ZlagAAT-2g.jpg?name=orig',
				// 'https://pbs.twimg.com/media/GtEveCeaIAA20dI.jpg?name=orig',
				// 'https://pbs.twimg.com/media/Gs9_GlkboAAqmgS.jpg?name=orig',
			],
		},
		{
			id: '5678',
			type: 'general',
			sender: null,
			sentAt: new Date(1200000),
			message: '이미지 테스트',
			attachments: [
				'https://pbs.twimg.com/media/Gs_3JaFaMAA8kCN.jpg?name=orig',
				'https://pbs.twimg.com/media/GtKU7MibMAMZzo5.jpg?name=orig',
				'https://pbs.twimg.com/media/GtLOOpLbMAMp2Mw.jpg?name=orig',
				'https://pbs.twimg.com/media/GtLQhrjbgAEz0HO.jpg?name=orig',
				'https://pbs.twimg.com/media/GtIqoRvbMAAOYSm.jpg?name=orig',
				'https://pbs.twimg.com/media/Gs_CdezaQAAL7iT.jpg?name=orig',
				'https://pbs.twimg.com/media/GtA7WbyWIAAvEck.jpg?name=orig',
				'https://pbs.twimg.com/media/GtFI0ZlagAAT-2g.jpg?name=orig',
				'https://pbs.twimg.com/media/GtEveCeaIAA20dI.jpg?name=orig',
				'https://pbs.twimg.com/media/Gs9_GlkboAAqmgS.jpg?name=orig',
			],
		},
		{
			id: 'asdf',
			type: 'general',
			sender: null,
			sentAt: new Date(1200000),
			message: '텍스트 메시지 테스트',
		},
		{
			id: 'asdf',
			type: 'general',
			sender: null,
			sentAt: new Date(1200000),
			relatedMessage: {
				id: '1234',
				type: 'general',
				sender: user,
				sentAt: new Date(1100000),
				message: '텍스트 메시지 테스트',
			},
			message: '답장형 메시지 테스트',
		},
		{
			id: 'asdf',
			type: 'general',
			sender: null,
			sentAt: new Date(1200000),
			message: '장문의 기이이이이이이이다란 텍스트 메시지를 테스트해봅니다',
			relatedPost: {
				type: ArticleType.REQUEST,
				article: {
					thumbnail:
						'https://media.planet.moe/cache/media_attachments/files/114/667/992/480/752/949/original/482dbc6092f63524.jpeg',
					title: '없는 게시물',
					author: user!,
					category: ArticleCategory.TEXT,
					tags: [],
					id: 'asdf',
				},
			},
		},
		{
			id: 'asdf',
			type: 'general',
			sender: null,
			sentAt: new Date(1200000),
			message: '😂👨‍🦳✨🎂✈️💓',
		},
		{
			id: 'asdf',
			type: 'general',
			sender: user,
			sentAt: new Date(1250000),
			relatedMessage: {
				id: '5678',
				type: 'general',
				sender: null,
				sentAt: new Date(1200000),
				// message: '이미지 테스트',
				attachments: [
					'https://pbs.twimg.com/media/Gs_3JaFaMAA8kCN.jpg?name=orig',
					'https://pbs.twimg.com/media/GtKU7MibMAMZzo5.jpg?name=orig',
					'https://pbs.twimg.com/media/GtLOOpLbMAMp2Mw.jpg?name=orig',
					'https://pbs.twimg.com/media/GtLQhrjbgAEz0HO.jpg?name=orig',
					'https://pbs.twimg.com/media/GtIqoRvbMAAOYSm.jpg?name=orig',
					'https://pbs.twimg.com/media/Gs_CdezaQAAL7iT.jpg?name=orig',
					'https://pbs.twimg.com/media/GtA7WbyWIAAvEck.jpg?name=orig',
					'https://pbs.twimg.com/media/GtFI0ZlagAAT-2g.jpg?name=orig',
					'https://pbs.twimg.com/media/GtEveCeaIAA20dI.jpg?name=orig',
					'https://pbs.twimg.com/media/Gs9_GlkboAAqmgS.jpg?name=orig',
				],
			},
			message: '답장형 메시지 테스트',
		},
		{
			id: 'asdf',
			type: 'leave',
			sender: user,
			sentAt: new Date(1300000),
		},
	]);

	let container = $state<HTMLElement>();

	const scrollToBottom = () => {
		if (!container) return;

		const element = container.lastElementChild as HTMLElement;

		if (!element) return;

		container.scroll({ top: element.offsetTop });
	};

	onNavigate(scrollToBottom);
	$effect(scrollToBottom);

	const scrollToDM = (id: string) => {
		if (!container) return;

		const targetId = `dm-${id}`;
		const element = document.getElementById(targetId);

		if (!element) return;

		container.scroll({ top: element.offsetTop });
	};

	let openEmojiList = $state(false);
	let emojiListProps = $state({
		x: 0,
		y: 0,
		xMargin: 0,
		yMargin: 0,
		onEmoji: (_: Emoji | undefined) => {},
		autoClose: false,
		value: undefined as Emoji | undefined,
	});

	const onOpenEmojiList = (
		event: MouseEvent & {
			currentTarget: EventTarget & HTMLElement;
		},
		onEmoji: EmojiEventHandler,
		option?: { autoClose?: boolean; value?: Emoji },
	) => {
		event.stopPropagation(); // window.onclick 이벤트에 bubbling 되지 않도록 전파 방지 조치

		const clientRects = event.currentTarget.getClientRects()[0];

		emojiListProps = {
			x: clientRects.x + window.scrollX,
			y: clientRects.y + window.scrollY,
			xMargin: clientRects.width,
			yMargin: clientRects.height,
			onEmoji,
			autoClose: !!option?.autoClose,
			value: option?.value,
		};
		openEmojiList = true;
	};

	let dmDraft = $state<App.GeneralDM>({});

	$effect(() => {
		if (!user) return;

		dmDraft = {
			message: '',
			// relatedMessage: {
			// 	id: '5678',
			// 	type: 'general',
			// 	sender: null,
			// 	sentAt: new Date(1200000),
			// 	// message: '이미지 테스트',
			// 	attachments: [
			// 		'https://pbs.twimg.com/media/Gs_3JaFaMAA8kCN.jpg?name=orig',
			// 		'https://pbs.twimg.com/media/GtKU7MibMAMZzo5.jpg?name=orig',
			// 		'https://pbs.twimg.com/media/GtLOOpLbMAMp2Mw.jpg?name=orig',
			// 		'https://pbs.twimg.com/media/GtLQhrjbgAEz0HO.jpg?name=orig',
			// 		'https://pbs.twimg.com/media/GtIqoRvbMAAOYSm.jpg?name=orig',
			// 		'https://pbs.twimg.com/media/Gs_CdezaQAAL7iT.jpg?name=orig',
			// 		'https://pbs.twimg.com/media/GtA7WbyWIAAvEck.jpg?name=orig',
			// 		'https://pbs.twimg.com/media/GtFI0ZlagAAT-2g.jpg?name=orig',
			// 		'https://pbs.twimg.com/media/GtEveCeaIAA20dI.jpg?name=orig',
			// 		'https://pbs.twimg.com/media/Gs9_GlkboAAqmgS.jpg?name=orig',
			// 	],
			// },
			// attachments: [
			// 	'https://pbs.twimg.com/media/Gs_3JaFaMAA8kCN.jpg?name=orig',
			// 	'https://pbs.twimg.com/media/GtKU7MibMAMZzo5.jpg?name=orig',
			// 	'https://pbs.twimg.com/media/GtLOOpLbMAMp2Mw.jpg?name=orig',
			// 	'https://pbs.twimg.com/media/GtLQhrjbgAEz0HO.jpg?name=orig',
			// 	'https://pbs.twimg.com/media/GtIqoRvbMAAOYSm.jpg?name=orig',
			// 	'https://pbs.twimg.com/media/Gs_CdezaQAAL7iT.jpg?name=orig',
			// 	'https://pbs.twimg.com/media/GtA7WbyWIAAvEck.jpg?name=orig',
			// 	'https://pbs.twimg.com/media/GtFI0ZlagAAT-2g.jpg?name=orig',
			// 	'https://pbs.twimg.com/media/GtEveCeaIAA20dI.jpg?name=orig',
			// 	'https://pbs.twimg.com/media/Gs9_GlkboAAqmgS.jpg?name=orig',
			// ],
		};
	});

	const onEmoji: EmojiEventHandler = (emoji) => {
		dmDraft.message += emoji || '';
	};
</script>

<Header title="뫄뫄 님과의 대화" />

<Section class="flex size-full flex-col">
	<H2 class="flex-none">뫄뫄 님과의 대화</H2>
	<section
		bind:this={container}
		class="bg-background relative mt-4 size-full space-y-2 overflow-y-auto border p-2">
		{#each dms as dm, i}
			<Message
				dir={dm.sender ? Direction.RECEIVE : Direction.SEND}
				{dm}
				prev={dms[i - 1]}
				next={dms[i + 1]}
				id="dm-{dm.id}"
				onScrollToDM={scrollToDM}
				{onOpenEmojiList}
				tabindex={i + 1} />
		{/each}
	</section>
	{#if dmDraft.relatedMessage}
		<section class="bg-background flex w-full items-center space-x-2 border border-t-0 p-2">
			<a
				class="bg-secondary relative block w-full cursor-pointer space-y-2 border p-2 text-left"
				href="#dm-{dmDraft.relatedMessage.id}"
				onclick={(event) => {
					event.preventDefault(); // 화면 전체 스크롤을 차단
					scrollToDM(dmDraft.relatedMessage!.id);
				}}
				use:twemoji>
				<div class="flex items-center space-x-2 bg-inherit">
					<UserAvatar class="size-[2em] flex-none" user={dmDraft.relatedMessage.sender} />
					<strong>{dmDraft.relatedMessage.sender?.username}</strong>
					<Muted class="">{formatDatetimeString(dmDraft.relatedMessage.sentAt)}</Muted>
				</div>
				<div class="bg-inherit">
					{@html sanitizeHTML(
						(
							(dmDraft.relatedMessage.type === 'general' && dmDraft.relatedMessage.message) ||
							'<i>내용 없음</i>'
						).replace(/\n/g, '<br>'),
					)}
				</div>

				<Button
					size="icon"
					variant="outline"
					class="absolute top-2 right-2 cursor-pointer"
					onclick={(event) => {
						event.preventDefault();
						event.stopPropagation();
						delete dmDraft.relatedMessage;
					}}>
					<X />
				</Button>
			</a>
		</section>
	{/if}
	{#if dmDraft.attachments && dmDraft.attachments.length > 0}
		<section
			class="bg-background flex w-full items-center justify-center space-x-2 border border-t-0 p-2">
			<MediaListCarousel
				media={dmDraft.attachments.map((v, idx) => ({ src: v, alt: `첨부 이미지 ${idx + 1}` }))}
				opts={{ loop: false }}>
				{#snippet child(medium)}
					<Card.Root class="size-full">
						<img class="size-full" src={medium.src} alt={medium.alt} />
						<X
							class="bg-destructive text-destructive-foreground absolute top-2 right-2 size-5"
							onclick={() => {
								dmDraft.attachments = dmDraft.attachments!.filter((v) => v !== medium.src);
							}} />
					</Card.Root>
				{/snippet}
			</MediaListCarousel>
		</section>
	{/if}
	<section class="bg-background flex w-full items-center space-x-2 border border-t-0 p-2">
		<Button size="icon" variant="secondary">
			<!-- 파일 첨부 -->
			<Paperclip />
		</Button>
		<Input name="chat" placeholder="메시지를 입력하세요..." bind:value={dmDraft.message} />
		<Button size="icon" variant="secondary" onclick={(event) => onOpenEmojiList(event, onEmoji)}>
			<!-- 이모티콘 추가 -->
			<SmilePlus />
		</Button>
		<Button size="icon">
			<!-- 전송 -->
			<SendHorizontal />
		</Button>
	</section>
</Section>

<EmojiList bind:open={openEmojiList} {...emojiListProps} />
