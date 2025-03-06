<script module lang="ts">
	export const Class = 'scroll-m-20 text-xl font-semibold tracking-tight';
</script>

<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	type $$Props = HTMLAttributes<HTMLDivElement>;

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<h4 class={cn(Class, className)} {...$$restProps}><slot /></h4>
