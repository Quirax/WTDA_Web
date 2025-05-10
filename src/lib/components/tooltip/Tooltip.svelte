<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		text: string;
		disabled?: boolean;
	}

	const { children, text, disabled = false }: Props = $props();
</script>

<Tooltip.Provider>
	<Tooltip.Root>
		<Tooltip.Trigger {disabled}>{@render children?.()}</Tooltip.Trigger>
		<Tooltip.Content>
			<p>{text}</p>
		</Tooltip.Content>
	</Tooltip.Root>
</Tooltip.Provider>
