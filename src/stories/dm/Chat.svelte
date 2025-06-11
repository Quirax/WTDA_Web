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
</script>

<Header title="뫄뫄 님과의 대화" />

<Section class="flex size-full flex-col">
	<H2 class="flex-none">뫄뫄 님과의 대화</H2>
	<section class="bg-background mt-4 size-full space-y-2 overflow-y-auto border p-2">
		<Message
			dir={Direction.RECEIVE}
			dm={{
				id: 'asdf',
				type: 'join',
				sender: user,
				sentAt: new Date(),
			}} />
		<Message
			dir={Direction.RECEIVE}
			dm={{
				id: 'asdf',
				type: 'general',
				sender: user,
				sentAt: new Date(),
				message: '텍스트 메시지 테스트',
			}} />
		<Message
			dir={Direction.RECEIVE}
			dm={{
				id: 'asdf',
				type: 'general',
				sender: user,
				sentAt: new Date(),
				message: '장문의 기이이이이이이이다란 텍스트 메시지를 테스트해봅니다',
			}} />
		<Message
			dir={Direction.RECEIVE}
			dm={{
				id: 'asdf',
				type: 'general',
				sender: user,
				sentAt: new Date(),
				message: '장문의 기이이이이이이이다란\n텍스트 메시지를 테스트해봅니다',
			}} />
		<Message
			dir={Direction.SEND}
			dm={{
				id: 'asdf',
				type: 'general',
				sender: user,
				sentAt: new Date(),
				message: '텍스트 메시지 테스트',
			}} />
		<Message
			dir={Direction.SEND}
			dm={{
				id: 'asdf',
				type: 'general',
				sender: user,
				sentAt: new Date(),
				message: '장문의 기이이이이이이이다란 텍스트 메시지를 테스트해봅니다',
			}} />
		<Message
			dir={Direction.RECEIVE}
			dm={{
				id: 'asdf',
				type: 'leave',
				sender: user,
				sentAt: new Date(),
			}} />
	</section>
	<section class="bg-background flex w-full items-center space-x-2 border border-t-0 p-2">
		<Button size="icon" variant="secondary">
			<!-- 파일 첨부 -->
			<Paperclip />
		</Button>
		<Input placeholder="메시지를 입력하세요..." />
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
