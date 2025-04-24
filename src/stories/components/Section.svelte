<svelte:options runes />

<script module lang="ts">
	export const Class = 'm-10';
</script>

<script lang="ts">
	import { cn } from '$lib/utils';
	import { fn } from '@storybook/test';
	import type { HTMLAttributes } from 'svelte/elements';

	type $$Props = HTMLAttributes<HTMLDivElement>;

	const { children = fn(), class: className = undefined, ...restProps } = $props();
</script>

<section class={cn(Class, className)} {...restProps}>
	{@render children()}
</section>
