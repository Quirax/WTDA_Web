<svelte:options runes />

<script module lang="ts">
	export const Class = 'm-10';
</script>

<script lang="ts">
	import '../../app.css';

	import { cn } from '$lib/utils';
	import { fn } from '@storybook/test';
	import type { HTMLAttributes } from 'svelte/elements';

	type $$Props = HTMLAttributes<HTMLDivElement>;

	const { children = fn(), className = undefined, ...restProps } = $props();

	export { className as class };
</script>

<section class={cn(Class, className)} {...restProps}>
	{@render children()}
</section>
