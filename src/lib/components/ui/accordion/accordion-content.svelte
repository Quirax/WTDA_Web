<script lang="ts">
	import { Accordion as AccordionPrimitive } from 'bits-ui';
	import { cn, type WithoutChild } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		children,
		child: nestedChild,
		...restProps
	}: AccordionPrimitive.ContentProps = $props();
</script>

<AccordionPrimitive.Content
	bind:ref
	data-slot="accordion-content"
	class="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
	{...restProps}>
	{#snippet child({ props, open })}
		<div class={cn('pt-0 pb-4', className)}>
			{#if nestedChild}
				{@render nestedChild({ props, open })}
			{:else}
				{@render children?.()}
			{/if}
		</div>
	{/snippet}
</AccordionPrimitive.Content>
