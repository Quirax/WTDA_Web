<script lang="ts">
	import H2 from '$lib/components/typo/h2.svelte';
	import Header from '$stories/components/Header.svelte';
	import Section from '$stories/components/Section.svelte';

	interface Props extends ReturnType<typeof $props> {}

	const {}: Props = $props();
</script>

<Header title="뫄뫄 님과의 대화" />

<Section>
	<H2>뫄뫄 님과의 대화</H2>
</Section>
