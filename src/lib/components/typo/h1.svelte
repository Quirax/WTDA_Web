<script module lang="ts">
	export const Class = 'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl';
</script>

<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	type $$Props = HTMLAttributes<HTMLDivElement>;

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<h1 class={cn(Class, className)} {...$$restProps}><slot /></h1>
