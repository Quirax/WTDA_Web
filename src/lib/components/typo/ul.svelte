<script module lang="ts">
	export const Class = 'my-6 ml-6 list-disc [&>li]:mt-2';
</script>

<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	type $$Props = HTMLAttributes<HTMLDivElement>;

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<ul class={cn(Class, className)} {...$$restProps}><slot /></ul>
