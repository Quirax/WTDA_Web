<script lang="ts">
	import emojiList from '$lib/assets/emoji.json';
	import Tooltip from '$lib/components/tooltip/Tooltip.svelte';
	import * as Accordion from '$lib/components/ui/accordion';
	import { Button } from '$lib/components/ui/button';
	import { cn, twemoji } from '$lib/utils';

	interface Props {
		x: number;
		y: number;
		xMargin?: number;
		yMargin?: number;
		open?: boolean;
	}

	let { x: xCoord, y: yCoord, xMargin = 0, yMargin = 0, open = $bindable(false) }: Props = $props();

	const onClose = () => (open = false);

	let listView = $state<HTMLElement>();
	let xFinal = $state(0),
		yFinal = $state(0);

	$effect(() => {
		if (!listView) return;
		if (!xCoord || !yCoord) return;

		xFinal = xCoord + xMargin;
		yFinal = yCoord + yMargin;

		if (xFinal + listView.offsetWidth > screen.availWidth) xFinal = xCoord - listView.offsetWidth;
		if (yFinal + listView.offsetHeight > screen.availHeight)
			yFinal = yCoord - listView.offsetHeight;

		console.log(xFinal, yFinal);
	});
</script>

<div
	bind:this={listView}
	class={cn(
		'bg-background absolute z-20 max-h-100 w-86 overflow-auto border p-2',
		!open && 'hidden',
	)}
	style="top: {yFinal}px; left: {xFinal}px;"
	use:twemoji>
	<Accordion.Root type="single" value={emojiList[0].name}>
		{#each emojiList as category}
			<Accordion.Item value={category.name}>
				<Accordion.Trigger>{category.name}</Accordion.Trigger>
				<Accordion.Content class="grid grid-cols-6 gap-2">
					{#each category.list as emoji}
						<Tooltip text={emoji.name}>
							<Button size="icon" variant="ghost" class="text-2xl">
								{emoji.emoji}
							</Button>
						</Tooltip>
					{/each}
				</Accordion.Content>
			</Accordion.Item>
		{/each}
	</Accordion.Root>
</div>
