<script lang="ts">
	import Markdown from '$lib/components/markdown/Markdown.svelte';
	import { onMount } from 'svelte';
	import Header from './components/Header.svelte';
	import Section from './components/Section.svelte';
	import * as Alert from '$lib/components/ui/alert';
	import { AlertCircleIcon } from 'lucide-svelte';

	const { src, title }: { src: string; title: string } = $props();

	let md = $state('');

	onMount(() => {
		fetch(src)
			.then((r) => r.text())
			.then((content) => (md = content));
	});
</script>

<Header {title} />

<Section>
	<Alert.Root variant="destructive">
		<AlertCircleIcon />
		<Alert.Title>이 규정은 데모용 샘플입니다.</Alert.Title>
		<Alert.Description>
			실제 운영중인 사이트가 아니므로, 디자인 샘플로만 봐주시기 바랍니다.
		</Alert.Description>
	</Alert.Root>

	<Markdown {md} />
</Section>
