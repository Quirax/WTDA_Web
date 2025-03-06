<script module lang="ts">
	export const Class = 'mt-6 border-l-2 pl-6 italic';
</script>

<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	type $$Props = HTMLAttributes<HTMLDivElement>;

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<blockquote class={cn(Class, className)} {...$$restProps}><slot /></blockquote>
