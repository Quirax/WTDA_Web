<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import type { Snippet } from 'svelte';
	import type { MouseEventHandler } from 'svelte/elements';

	interface Props {
		children?: Snippet;
		text: string;
		disabled?: boolean;
		class?: string;
		onclick?: MouseEventHandler<HTMLElement>;
		child?: Snippet<[{ props: Record<string, unknown> }]>;
	}

	const {
		children,
		text,
		disabled = false,
		class: className,
		onclick,
		child: myChild,
	}: Props = $props();
</script>

<Tooltip.Provider {disabled}>
	<Tooltip.Root>
		{#if myChild}
			<Tooltip.Trigger>
				{#snippet child({ props })}
					{@render myChild({ props })}
				{/snippet}
			</Tooltip.Trigger>
		{:else}
			<Tooltip.Trigger class={className} {onclick}>
				{@render children?.()}
			</Tooltip.Trigger>
		{/if}
		<Tooltip.Content>
			<p>{text}</p>
		</Tooltip.Content>
	</Tooltip.Root>
</Tooltip.Provider>
