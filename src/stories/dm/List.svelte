<script lang="ts">
	import H2 from '$lib/components/typo/h2.svelte';
	import Header from '$stories/components/Header.svelte';
	import Section from '$stories/components/Section.svelte';

	interface Props extends ReturnType<typeof $props> {}

	const {}: Props = $props();
</script>

<Header title="메시지 채널" />

<Section>
	<H2>메시지 채널</H2>
</Section>
