<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';
	import Layout from '$stories/dm/Layout.svelte';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();
</script>

<Layout id={data.id} channels={data.channels}>
	{@render children()}
</Layout>
