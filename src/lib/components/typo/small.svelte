<script module lang="ts">
	export const Class = 'text-sm font-medium leading-none';
</script>

<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	type $$Props = HTMLAttributes<HTMLDivElement>;

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<small class={cn(Class, className)} {...$$restProps}><slot /></small>
