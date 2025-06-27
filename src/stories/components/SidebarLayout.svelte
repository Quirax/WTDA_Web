<script lang="ts">
	import { page } from '$app/state';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'tailwind-variants';

	interface Props {
		containerClass?: ClassValue;
		navClass?: ClassValue;
		contentClass?: ClassValue;
		nav: Snippet;
		content: Snippet;
	}

	const { containerClass, navClass, contentClass, nav, content }: Props = $props();
</script>

<div class={cn('w-ful flex max-md:flex-col', containerClass)}>
	<nav
		class={cn(
			'bg-background mt-16 w-70 flex-none overflow-y-auto max-md:w-full',
			!!page.params.id && 'max-md:hidden',
			navClass,
		)}>
		{@render nav()}
	</nav>

	<div class={cn('size-full', contentClass)}>
		{@render content()}
	</div>
</div>
