<script lang="ts">
	import SidebarLayout from '$stories/components/SidebarLayout.svelte';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<SidebarLayout containerClass={undefined}>
	{#snippet nav()}
		나-브
	{/snippet}
	{#snippet content()}
		{@render children()}
	{/snippet}
</SidebarLayout>
