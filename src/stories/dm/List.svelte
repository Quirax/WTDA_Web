<script lang="ts">
	import H2 from '$lib/components/typo/h2.svelte';
	import Header from '$stories/components/Header.svelte';
	import Section from '$stories/components/Section.svelte';
	import { MessageSquare } from 'lucide-svelte';

	interface Props extends ReturnType<typeof $props> {}

	const {}: Props = $props();
</script>

<Header title="메시지 대화 목록" />

<Section class="flex size-full flex-col items-center justify-center max-md:hidden">
	<div class="size-44 rounded-full border-2 border-white p-7">
		<MessageSquare class="size-30" />
	</div>
	<H2 class="mt-8 border-0">왼쪽 대화 항목를 선택하여 대화를 이어나가보세요.</H2>
</Section>
