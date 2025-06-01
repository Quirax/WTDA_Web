<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		text: string;
		disabled?: boolean;
		class?: string;
	}

	const { children, text, disabled = false, class: className }: Props = $props();
</script>

<Tooltip.Provider>
	<Tooltip.Root>
		<Tooltip.Trigger class={className} {disabled}>{@render children?.()}</Tooltip.Trigger>
		<Tooltip.Content>
			<p>{text}</p>
		</Tooltip.Content>
	</Tooltip.Root>
</Tooltip.Provider>
