<script lang="ts">
	import H2 from '$lib/components/typo/h2.svelte';
	import { m } from '$lib/messages';
	import Header from '$stories/components/Header.svelte';
	import Section from '$stories/components/Section.svelte';
	import { MessageSquare } from 'lucide-svelte';

	interface Props extends ReturnType<typeof $props> {}

	const {}: Props = $props();
</script>

<Header title={m['DM.LIST.TITLE']()} />

<Section class="flex size-full flex-col items-center justify-center max-md:hidden">
	<div class="size-44 rounded-full border-2 border-white p-7">
		<MessageSquare class="size-30" />
	</div>
	<H2 class="mt-8 border-0">{m['DM.LIST.DESCRIPTION']()}</H2>
</Section>
