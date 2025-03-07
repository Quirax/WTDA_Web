<script module lang="ts">
	export const Class = 'text-lg font-semibold';
</script>

<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	type $$Props = HTMLAttributes<HTMLDivElement>;

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<span class={cn(Class, className)} {...$$restProps}><slot /></span>
