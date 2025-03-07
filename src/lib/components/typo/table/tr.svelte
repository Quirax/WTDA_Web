<script module lang="ts">
	export const Class = 'even:bg-muted m-0 border-t p-0';
</script>

<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	type $$Props = HTMLAttributes<HTMLDivElement>;

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<tr class={cn(Class, className)} {...$$restProps}><slot /></tr>
