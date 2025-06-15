<script lang="ts">
	import * as Carousel from '$lib/components/ui/carousel';
	import * as Card from '$lib/components/ui/card';
	import type { ClassValue } from 'svelte/elements';
	import { cn } from '$lib/utils';
	import type { CarouselProps } from '$lib/components/ui/carousel/context';
	import type { Snippet } from 'svelte';

	interface Props extends CarouselProps {
		media: { src: string; alt?: string }[];
		listClass?: ClassValue;
		itemClass?: ClassValue;
		child?: Snippet<[{ src: string; alt?: string }, number]>;
		onClickItem?: (event: MouseEvent, idx: number) => void;
	}

	const {
		media,
		onClickItem,
		class: classList,
		listClass,
		itemClass,
		opts,
		child,
	}: Props = $props();
</script>

<Carousel.Root class={cn('align-center', classList)} opts={{ loop: true, align: 'start', ...opts }}>
	<Carousel.Content class={cn('w-44 md:w-88 lg:w-132 xl:w-176 2xl:w-220', listClass)}>
		{#each media as medium, idx}
			<Carousel.Item
				class={cn(
					'relative aspect-square h-40 md:basis-1/2 lg:basis-1/3 xl:basis-1/4 2xl:basis-1/5',
					itemClass,
				)}
				onclick={(event) => onClickItem && onClickItem(event, idx)}>
				<div class="size-full p-1">
					{#if child}
						{@render child(medium, idx)}
					{:else}
						<Card.Root class="size-full">
							<img class="size-full object-cover" src={medium.src} alt={medium.alt} />
						</Card.Root>
					{/if}
				</div>
			</Carousel.Item>
		{/each}
	</Carousel.Content>
	<Carousel.Previous />
	<Carousel.Next />
</Carousel.Root>
