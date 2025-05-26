<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Carousel from '$lib/components/ui/carousel';
	import type { CarouselAPI } from '$lib/components/ui/carousel/context';
	import { cn } from '$lib/utils';
	import 'photoswipe/style.css';
	import PhotoSwipe, { type PhotoSwipeOptions } from 'photoswipe';

	interface Props {
		media: { src: string; alt?: string }[];
	}

	const { media }: Props = $props();

	const dataSource = media.map((medium) => ({
		src: medium.src,
		alt: medium.alt,
		height: 0,
		width: 0,
	}));

	let api = $state<CarouselAPI>();
	let current = $state(0);

	$effect(() => {
		if (api) {
			current = api.selectedScrollSnap();
			api.on('select', () => {
				current = api!.selectedScrollSnap();
			});
		}
	});

	const onLoadMedia =
		(idx: number) =>
		({ target }: Event) => {
			const tg = target as HTMLImageElement;
			dataSource[idx].height = tg.naturalHeight;
			dataSource[idx].width = tg.naturalWidth;
		};

	const onShowPhotoSwipe = () => {
		const photoSwipeOptions: PhotoSwipeOptions = {
			dataSource,
			showHideAnimationType: 'none',
			index: current,
		};

		const pswp = new PhotoSwipe(photoSwipeOptions);
		pswp.init();
	};
</script>

<section class="relative my-4 flex justify-center px-17">
	<Carousel.Root
		class="align-center h-[50vh] max-w-full"
		opts={{ loop: true }}
		setApi={(emblaApi) => (api = emblaApi)}>
		<Carousel.Previous />
		<Carousel.Content class="w-full">
			{#each media as medium, idx}
				<Carousel.Item>
					<div class="flex h-[50vh] items-center justify-center p-1">
						<Card.Root class="size-full" onclick={onShowPhotoSwipe}>
							<img
								class="size-full object-contain"
								src={medium.src}
								alt={medium.alt}
								onload={onLoadMedia(idx)} />
						</Card.Root>
					</div>
				</Carousel.Item>
			{/each}
		</Carousel.Content>
		<Carousel.Next />
	</Carousel.Root>
</section>
<div class="flex w-full justify-center">
	<Carousel.Root class="align-center" opts={{ loop: true, align: 'start' }}>
		<Carousel.Content class="w-44 md:w-88 lg:w-132 xl:w-176 2xl:w-220">
			{#each media as medium, idx}
				<Carousel.Item
					class="relative aspect-square h-40 md:basis-1/2 lg:basis-1/3 xl:basis-1/4 2xl:basis-1/5"
					onclick={() => {
						api?.scrollTo(idx);
					}}>
					<div class="size-full p-1">
						<Card.Root class={cn('size-full', idx === current && 'border-primary border-3')}>
							<img class="size-full object-cover" src={medium.src} alt={medium.alt} />
						</Card.Root>
					</div>
				</Carousel.Item>
			{/each}
		</Carousel.Content>
		<Carousel.Previous />
		<Carousel.Next />
	</Carousel.Root>
</div>
