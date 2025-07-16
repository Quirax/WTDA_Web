<svelte:options runes />

<script module lang="ts">
	export const Class = 'p-10 pt-26';
</script>

<script lang="ts">
	import { cn } from '$lib/utils';
	import { fn } from '@storybook/test';
	import type { HTMLAttributes } from 'svelte/elements';

	const { children = fn(), class: className = undefined, ...restProps } = $props();
</script>

<section class={cn(Class, className)} {...restProps}>
	{@render children()}
</section>
