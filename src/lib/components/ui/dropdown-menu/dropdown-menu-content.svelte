<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils.js';

	type $$Props = DropdownMenuPrimitive.ContentProps;
	type $$Events = DropdownMenuPrimitive.ContentEvents;

	let className: $$Props['class'] = undefined;
	export let sideOffset: $$Props['sideOffset'] = 4;
	export { className as class };
</script>

<DropdownMenuPrimitive.Content
	{sideOffset}
	class={cn(
		'bg-popover text-popover-foreground z-50 min-w-[8rem] border-2 p-1 shadow-md focus:outline-none',
		className,
	)}
	{...$$restProps}
	on:keydown>
	<slot />
</DropdownMenuPrimitive.Content>
