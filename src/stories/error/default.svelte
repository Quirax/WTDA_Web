<script lang="ts">
	import H2 from '$lib/components/typo/h2.svelte';
	import P from '$lib/components/typo/p.svelte';
	import { HTTPStatusText } from '$lib/messages';
	import Header from '$stories/components/Header.svelte';
	import Section from '$stories/components/Section.svelte';
	import type { DescriberProps } from './describer';

	interface Props extends DescriberProps {
		status: number;
	}

	const { error, status }: Props = $props();
	const statusText = HTTPStatusText[status];
</script>

<Header title={`HTTP ${status} - ${statusText}`} />

<Section>
	<H2>HTTP {status} - {statusText}</H2>
	<P>{error.message}</P>
</Section>
