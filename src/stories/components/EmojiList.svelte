<script lang="ts" module>
	export type EmojiEventHandler = (emoji: Emoji | undefined) => void;
</script>

<script lang="ts">
	import emojiList from '$lib/assets/emoji.json';
	import Tooltip from '$lib/components/tooltip/Tooltip.svelte';
	import * as Accordion from '$lib/components/ui/accordion';
	import { Accordion as AccordionPrimitive } from 'bits-ui';
	import { Button } from '$lib/components/ui/button';
	import { cn, twemoji } from '$lib/utils';
	import type { Emoji } from 'emoji-type';
	import { Trash } from 'lucide-svelte';
	import { untrack } from 'svelte';
	import type { MouseEventHandler } from 'svelte/elements';
	import { m } from '$lib/messages';

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

		const clientRects = listView.getClientRects()[0];

		xFinal = xCoord + xMargin;
		yFinal = yCoord + yMargin;

		if (untrack(() => xFinal + clientRects.width) > document.body.scrollWidth)
			xFinal = xCoord - clientRects.width;
		if (untrack(() => yFinal + clientRects.height) > document.body.scrollHeight)
			yFinal = yCoord - clientRects.height;

		if (untrack(() => xFinal) < 0) xFinal = 0;
		if (untrack(() => yFinal) < 0) yFinal = 0;
	});

	$effect(() => {
		if (!open) window.removeEventListener('click', onClickOuside);
		else window.addEventListener('click', onClickOuside);
	});
</script>

{#if open}
	<div
		bind:this={listView}
		class={cn('bg-background absolute z-20 max-h-100 w-86 overflow-auto border p-2')}
		style="top: {yFinal}px; left: {xFinal}px;">
		{#if value}
			<Tooltip text={m['EMOJI_LIST.CANCEL']()}>
				{#snippet child({ props })}
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
				{/snippet}
			</Tooltip>
		{/if}
		<Accordion.Root type="single" value={emojiList[0].name}>
			{#each emojiList as category}
				<Accordion.Item value={category.name}>
					<Accordion.Trigger>{category.name}</Accordion.Trigger>
					<!-- ref: https://bits-ui.com/docs/components/accordion#svelte-transitions -->
					<AccordionPrimitive.Content class="grid grid-cols-6 gap-2" forceMount={true}>
						{#snippet child({ props, open })}
							{#if open}
								<div {...props} use:twemoji>
									{#each category.list as emoji}
										<Tooltip text={emoji.name}>
											{#snippet child({ props })}
												<Button
													{...props}
													size="icon"
													variant={emoji.emoji === value ? 'default' : 'ghost'}
													class="text-2xl"
													onclick={() => {
														onEmoji(emoji.emoji as Emoji);
														autoClose && onClose();
													}}>
													{emoji.emoji}
												</Button>
											{/snippet}
										</Tooltip>
									{/each}
								</div>
							{/if}
						{/snippet}
					</AccordionPrimitive.Content>
				</Accordion.Item>
			{/each}
		</Accordion.Root>
	</div>
{/if}
