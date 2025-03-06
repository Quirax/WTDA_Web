<script module lang="ts">
	export const Class = 'leading-7 [&:not(:first-child)]:mt-6';
</script>

<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	type $$Props = HTMLAttributes<HTMLDivElement>;

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<p class={cn(Class, className)} {...$$restProps}><slot /></p>
