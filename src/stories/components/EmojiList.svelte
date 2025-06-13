<script lang="ts">
	import emojiList from '$lib/assets/emoji.json';
	import * as Accordion from '$lib/components/ui/accordion';
	import { Button } from '$lib/components/ui/button';
	import { twemoji } from '$lib/utils';

	interface Props {
		x: number;
		y: number;
		xMargin?: number;
		yMargin?: number;
		open?: boolean;
	}

	let { x: xCoord, y: yCoord, xMargin = 0, yMargin = 0, open = $bindable(false) }: Props = $props();

	const onClose = () => (open = false);
</script>

{#if open}
	<div
		class="bg-background absolute z-20 max-h-100 w-86 overflow-auto border p-2"
		style="top: {yCoord + yMargin}px; left: {xCoord + xMargin}px;"
		use:twemoji>
		<Accordion.Root type="single" value={emojiList[0].name}>
			{#each emojiList as category}
				<Accordion.Item value={category.name}>
					<Accordion.Trigger>{category.name}</Accordion.Trigger>
					<Accordion.Content class="grid grid-cols-6 gap-2">
						{#each category.list as emoji}
							<Button size="icon" variant="ghost" class="text-2xl" title={emoji.name}>
								{emoji.emoji}
							</Button>
						{/each}
					</Accordion.Content>
				</Accordion.Item>
			{/each}
		</Accordion.Root>
	</div>
{/if}
