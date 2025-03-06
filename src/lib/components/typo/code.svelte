<script module lang="ts">
	export const Class =
		'bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold';
</script>

<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	type $$Props = HTMLAttributes<HTMLDivElement>;

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<code class={cn(Class, className)} {...$$restProps}><slot /></code>
