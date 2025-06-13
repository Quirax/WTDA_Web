<script lang="ts">
	import emojiList from '$lib/assets/emoji.json';

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
		class="bg-background absolute z-20 border p-2"
		style="top: {yCoord + yMargin}px; left: {xCoord + xMargin}px;">
		{#each emojiList as category}
			<dl>
				<dt>{category.name}</dt>
				{#each category.list as emoji}
					<dd>{emoji.emoji} = {emoji.name}</dd>
				{/each}
			</dl>
		{/each}
	</div>
{/if}
