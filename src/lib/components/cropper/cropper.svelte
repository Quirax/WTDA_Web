<svelte:options runes />

<script lang="ts">
	import Cropper, { type CropperProps } from 'svelte-easy-crop';
	import Slider from '../ui/slider/slider.svelte';

	const {
		aspect = 1 / 1,
		minZoom = 1,
		maxZoom = 3,
		...restProps
	}: Partial<Omit<CropperProps, 'crop' | 'zoom'>> = $props();

	let crop = $state({ x: 0, y: 0 });
	let zoom = $state(1);
</script>

<div class="relative w-full aspect-square">
	<Cropper bind:crop bind:zoom {aspect} {minZoom} {maxZoom} {...restProps} />
</div>

<Slider type="single" bind:value={zoom} max={maxZoom} min={minZoom} step={0.01} />
