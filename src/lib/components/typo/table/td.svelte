<script module lang="ts">
	export const Class =
		'border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right';
</script>

<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	type $$Props = HTMLAttributes<HTMLDivElement>;

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<td class={cn(Class, className)} {...$$restProps}><slot /></td>
