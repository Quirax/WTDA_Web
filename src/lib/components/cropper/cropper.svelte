<svelte:options runes />

<script lang="ts" module>
	export type CropArea = {
		x: number;
		y: number;
		width: number;
		height: number;
	};
</script>

<script lang="ts">
	import {
		CropWindow,
		defaultValue,
		type Options as CropOptions,
		defaultOverlayOptions,
		defaultOptions,
	} from 'svelte-crop-window';
	import Slider from '../ui/slider/slider.svelte';
	import { createImage, getCroppedImg, getFlippedImage, getRotatedImage } from './util';
	import { onDestroy, onMount } from 'svelte';
	import {
		ZoomIn,
		ZoomOut,
		FlipHorizontal2,
		FlipVertical2,
		RotateCw,
		RotateCcw,
	} from 'lucide-svelte';
	import Button from '../ui/button/button.svelte';

	interface Props extends Partial<CropOptions<Partial<typeof defaultOverlayOptions>>> {
		image: string;
		minZoom?: number;
		maxZoom?: number;
		aspect?: number;
	}

	const { image = '', minZoom = 1, maxZoom = 3, aspect = 4 / 3, ..._options }: Props = $props();

	const options = { ...defaultOptions, ..._options };

	let value = $state({
		...defaultValue,
		aspect,
	});

	// Get image size to calculate output dimension
	let _image = $state<string>(image);
	let imageSize = $state<{ height: number; width: number }>();

	const afterConversion = (converted: string) => {
		_image = converted;
		value = {
			...defaultValue,
			aspect,
		};
		createImage(_image).then(
			(imgObj) => (imageSize = { height: imgObj.height, width: imgObj.width }),
		);
	};

	const rotateImage = (rotation: 0 | 90 | 270 = 0) => {
		getRotatedImage(_image, rotation).then(afterConversion);
	};

	rotateImage(0);

	// Several routines to get container's offset size and set view's size
	let container = $state<HTMLDivElement>();
	let viewHeight = $state(0);
	let viewWidth = $state(0);

	// Reset view's size to recalculate container's size
	const onResize = () => {
		if (!container) return;

		viewWidth = 0;
		viewHeight = 0;
	};

	// Set view's size
	$effect(() => {
		if (!container) return;
		if (viewHeight > 0) return;
		if (viewWidth > 0) return;

		viewWidth = container.offsetWidth;
		viewHeight = screen.height - (container.offsetParent as HTMLDivElement)!.offsetHeight;

		if (viewWidth < viewHeight) viewHeight = viewWidth;
		else viewWidth = viewHeight;
	});

	// Set and reset event listener
	// ref: https://beomy.github.io/tech/svelte/lifecycle/
	onMount(() => {
		window.addEventListener('resize', onResize);
	});

	onDestroy(() => {
		window.removeEventListener('resize', onResize);
	});

	export const getImage = () =>
		new Promise<string | null>((resolve) => {
			if (!imageSize) return resolve(null);

			const targetHeight = imageSize.height / value.scale;
			const targetWidth = value.aspect * targetHeight;

			const targetX = (imageSize.width - targetWidth) / 2 - value.position.x * targetHeight;
			const targetY = (imageSize.height - targetHeight) / 2 - value.position.y * targetHeight;

			getCroppedImg(_image, {
				x: targetX,
				y: targetY,
				width: targetWidth,
				height: targetHeight,
			}).then((destImage) => resolve(destImage));
		});

	const onClickZoomButton = (delta: number) => () => {
		value.scale = Math.max(Math.min(value.scale + delta, maxZoom), minZoom);
	};

	const onClickFlipButton = (direction: 'horizontal' | 'vertical') => () => {
		getFlippedImage(_image, direction).then(afterConversion);
	};
</script>

<div class="relative w-full" bind:this={container}>
	<div style={`height: ${viewHeight}px; width: ${viewWidth}px;`} class="mx-auto">
		<CropWindow media={{ content_type: 'image', url: _image }} bind:value {options} />
	</div>
</div>
<div class="flex w-full space-x-4">
	<Button variant="outline" size="icon" class="flex-none" onclick={onClickZoomButton(-0.5)}>
		<ZoomOut />
	</Button>
	<Slider type="single" bind:value={value.scale} max={maxZoom} min={minZoom} step={0.01} />
	<Button variant="outline" size="icon" class="flex-none" onclick={onClickZoomButton(0.5)}>
		<ZoomIn />
	</Button>
</div>
<div class="flex w-full justify-center">
	<Button variant="outline" size="icon" onclick={onClickFlipButton('horizontal')}>
		<FlipHorizontal2 />
	</Button>
	<Button variant="outline" size="icon" onclick={onClickFlipButton('vertical')}>
		<FlipVertical2 />
	</Button>
	<Button variant="outline" size="icon" onclick={() => rotateImage(270)}><RotateCcw /></Button>
	<Button variant="outline" size="icon" onclick={() => rotateImage(90)}><RotateCw /></Button>
</div>
