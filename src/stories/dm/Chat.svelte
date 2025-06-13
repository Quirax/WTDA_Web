<script lang="ts">
	import H2 from '$lib/components/typo/h2.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Header from '$stories/components/Header.svelte';
	import Section from '$stories/components/Section.svelte';
	import { Paperclip, SendHorizontal, SmilePlus } from 'lucide-svelte';
	import Message, { Direction } from './Message.svelte';
	import { userStore } from '$lib/context';
	import { ArticleCategory, ArticleType } from '@app';
	import EmojiList from '$stories/components/EmojiList.svelte';
	import type { MouseEventHandler } from 'svelte/elements';

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
			message: '텍스트 메시지 테스트',
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

	const scrollToDM = (id: string) => {
		if (!container) return;

		const targetId = `dm-${id}`;
		const element = document.getElementById(targetId);

		if (!element) return;

		container.scroll({ top: element.offsetTop });
	};

	let openEmojiList = $state(true);
	let emojiListProps = $state({
		x: 0,
		y: 0,
		xMargin: 0,
		yMargin: 0,
	});

	const onOpenEmojiList: MouseEventHandler<HTMLElement> = (event) => {
		emojiListProps = {
			x: event.currentTarget.offsetLeft,
			y: event.currentTarget.offsetTop,
			xMargin: event.currentTarget.offsetWidth,
			yMargin: event.currentTarget.offsetHeight,
		};
		openEmojiList = true;
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
				tabindex={i + 1} />
		{/each}
	</section>
	<section class="bg-background flex w-full items-center space-x-2 border border-t-0 p-2">
		<Button size="icon" variant="secondary">
			<!-- 파일 첨부 -->
			<Paperclip />
		</Button>
		<Input name="chat" placeholder="메시지를 입력하세요..." />
		<Button size="icon" variant="secondary" onclick={onOpenEmojiList}>
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
