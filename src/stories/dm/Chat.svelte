<script lang="ts">
	import H2 from '$lib/components/typo/h2.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Header from '$stories/components/Header.svelte';
	import Section from '$stories/components/Section.svelte';
	import { Paperclip, SendHorizontal, SmilePlus } from 'lucide-svelte';

	interface Props extends ReturnType<typeof $props> {}

	const {}: Props = $props();
</script>

<Header title="뫄뫄 님과의 대화" />

<Section class="flex size-full flex-col">
	<H2 class="flex-none">뫄뫄 님과의 대화</H2>
	<section class="mt-4 size-full border bg-black/40">
		<!-- 채팅 -->
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
