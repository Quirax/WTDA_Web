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
	import { createImage, getCroppedImg } from './util';
	import { number } from 'zod';
	import { onDestroy, onMount } from 'svelte';

	interface Props extends Partial<CropOptions<Partial<typeof defaultOverlayOptions>>> {
		image: string;
		oncropcomplete: (arg0: CropArea) => void;
		minZoom?: number;
		maxZoom?: number;
		aspect?: number;
	}

	const {
		image = '',
		oncropcomplete = () => {},
		minZoom = 1,
		maxZoom = 3,
		aspect = 4 / 3,
		..._options
	}: Props = $props();

	const options = { ...defaultOptions, ..._options };

	let imageSize = $state<{ height: number; width: number }>();
	createImage(image).then((imgObj) => (imageSize = { height: imgObj.height, width: imgObj.width }));

	let container = $state<HTMLDivElement>();
	let viewHeight = $state(0);
	let viewWidth = $state(0);

	const onResize = () => {
		if (!container) return;

		viewWidth = 0;
		viewHeight = 0;
	};

	$effect(() => {
		if (!container) return;
		if (viewHeight > 0) return;
		if (viewWidth > 0) return;

		viewWidth = container.offsetWidth;
		viewHeight = screen.height - (container.offsetParent as HTMLDivElement)!.offsetHeight;

		if (viewWidth < viewHeight * aspect) viewHeight = viewWidth / aspect;
		else viewWidth = viewHeight * aspect;
	});

	onMount(() => {
		window.addEventListener('resize', onResize);
	});

	onDestroy(() => {
		window.removeEventListener('resize', onResize);
	});

	let value = $state({
		...defaultValue,
		aspect,
	});

	$effect(() => {
		if (!value) return;

		if (!imageSize) return;

		const targetHeight = imageSize.height / value.scale;
		const targetWidth = value.aspect * targetHeight;

		const targetX = (imageSize.width - targetWidth) / 2 - value.position.x * targetHeight;
		const targetY = (imageSize.height - targetHeight) / 2 - value.position.y * targetHeight;

		oncropcomplete({ x: targetX, y: targetY, width: targetWidth, height: targetHeight });
	});
</script>

<div class="relative w-full" bind:this={container}>
	<div style={`height: ${viewHeight}px; width: ${viewWidth}px;`} class="mx-auto">
		<CropWindow media={{ content_type: 'image', url: image }} bind:value {options} />
	</div>
</div>

<Slider type="single" bind:value={value.scale} max={maxZoom} min={minZoom} step={0.01} />
