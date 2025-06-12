<script lang="ts">
	import H2 from '$lib/components/typo/h2.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Header from '$stories/components/Header.svelte';
	import Section from '$stories/components/Section.svelte';
	import { Paperclip, SendHorizontal, SmilePlus } from 'lucide-svelte';
	import Message, { Direction } from './Message.svelte';
	import { userStore } from '$lib/context';

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
			id: 'asdf',
			type: 'general',
			sender: user,
			sentAt: new Date(1100000),
			message: '텍스트 메시지 테스트',
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
			id: 'asdf',
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
			message: '장문의 기이이이이이이이다란 텍스트 메시지를 테스트해봅니다',
		},
		{
			id: 'asdf',
			type: 'leave',
			sender: user,
			sentAt: new Date(1200000),
		},
	]);
</script>

<Header title="뫄뫄 님과의 대화" />

<Section class="flex size-full flex-col">
	<H2 class="flex-none">뫄뫄 님과의 대화</H2>
	<section class="bg-background mt-4 size-full space-y-2 overflow-y-auto border p-2">
		{#each dms as dm, i}
			<Message
				dir={dm.sender ? Direction.RECEIVE : Direction.SEND}
				{dm}
				prev={dms[i - 1]}
				next={dms[i + 1]} />
		{/each}
	</section>
	<section class="bg-background flex w-full items-center space-x-2 border border-t-0 p-2">
		<Button size="icon" variant="secondary">
			<!-- 파일 첨부 -->
			<Paperclip />
		</Button>
		<Input name="chat" placeholder="메시지를 입력하세요..." />
		<Button size="icon" variant="secondary">
			<!-- 이모티콘 추가 -->
			<SmilePlus />
		</Button>
		<Button size="icon">
			<!-- 전송 -->
			<SendHorizontal />
		</Button>
	</section>
</Section>
