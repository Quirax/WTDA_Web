<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';
	import Layout from '$stories/admin/Layout.svelte';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();
</script>

<Layout>
	{@render children()}
</Layout>
