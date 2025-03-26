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

<div class="relative aspect-square w-[300px]">
	<CropWindow media={{ content_type: 'image', url: image }} bind:value {options} />
</div>

<Slider type="single" bind:value={value.scale} max={maxZoom} min={minZoom} step={0.01} />
