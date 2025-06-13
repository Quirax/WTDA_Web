<script lang="ts" module>
	export type EmojiEventHandler = (emoji: Emoji | undefined) => void;
</script>

<script lang="ts">
	import emojiList from '$lib/assets/emoji.json';
	import Tooltip from '$lib/components/tooltip/Tooltip.svelte';
	import * as Accordion from '$lib/components/ui/accordion';
	import { Button } from '$lib/components/ui/button';
	import { cn, twemoji } from '$lib/utils';
	import type { Emoji } from 'emoji-type';
	import { Trash } from 'lucide-svelte';
	import { untrack } from 'svelte';
	import type { MouseEventHandler } from 'svelte/elements';

	interface Props {
		x: number;
		y: number;
		xMargin?: number;
		yMargin?: number;
		open?: boolean;
		onEmoji?: EmojiEventHandler;
		autoClose?: boolean;
		value?: Emoji;
	}

	let {
		x: xCoord,
		y: yCoord,
		xMargin = 0,
		yMargin = 0,
		open = $bindable(false),
		onEmoji = () => {},
		autoClose = false,
		value,
	}: Props = $props();

	let listView = $state<HTMLElement>();
	let xFinal = $state(0),
		yFinal = $state(0);

	const onClose = () => (open = false);

	const onClickOuside = (event: MouseEvent) => {
		if (!listView) return;

		const clientRects = listView.getClientRects()[0];

		if (
			clientRects.left <= event.pageX &&
			event.pageX <= clientRects.right &&
			clientRects.top <= event.pageY &&
			event.pageY <= clientRects.bottom
		)
			return;

		onClose();
	};

	$effect(() => {
		if (!listView) return;

		xFinal = xCoord + xMargin;
		yFinal = yCoord + yMargin;

		if (untrack(() => xFinal + listView!.offsetWidth) > screen.availWidth)
			xFinal = xCoord - listView.offsetWidth;
		if (untrack(() => yFinal + listView!.offsetHeight) > screen.availHeight)
			yFinal = yCoord - listView.offsetHeight;
	});

	$effect(() => {
		if (!open) window.removeEventListener('click', onClickOuside);
		else window.addEventListener('click', onClickOuside);
	});
</script>

<div
	bind:this={listView}
	class={cn(
		'bg-background absolute z-20 max-h-100 w-86 overflow-auto border p-2',
		open ? 'block' : 'hidden',
	)}
	style="top: {yFinal}px; left: {xFinal}px;"
	use:twemoji>
	{#if value}
		<Tooltip text="선택을 취소하고 닫기">
			<Button
				size="icon"
				variant="ghost"
				class="text-2xl"
				onclick={() => {
					onEmoji(undefined);
					onClose();
				}}>
				<Trash />
			</Button>
		</Tooltip>
	{/if}
	<Accordion.Root type="single" value={emojiList[0].name}>
		{#each emojiList as category}
			<Accordion.Item value={category.name}>
				<Accordion.Trigger>{category.name}</Accordion.Trigger>
				<Accordion.Content class="grid grid-cols-6 gap-2">
					{#each category.list as emoji}
						<Tooltip text={emoji.name}>
							<Button
								size="icon"
								variant={emoji.emoji === value ? 'default' : 'ghost'}
								class="text-2xl"
								onclick={() => {
									onEmoji(emoji.emoji as Emoji);
									autoClose && onClose();
								}}>
								{emoji.emoji}
							</Button>
						</Tooltip>
					{/each}
				</Accordion.Content>
			</Accordion.Item>
		{/each}
	</Accordion.Root>
</div>
