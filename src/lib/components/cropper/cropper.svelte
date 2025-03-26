<svelte:options runes />

<script lang="ts">
	import Cropper, { type CropperProps } from 'svelte-easy-crop';

	const { aspect = 1 / 1, ...restProps }: Partial<Omit<CropperProps, 'crop' | 'zoom'>> = $props();

	let crop = $state({ x: 0, y: 0 });
	let zoom = $state(1);
</script>

<div class="relative w-full aspect-square">
	<Cropper bind:crop bind:zoom {aspect} {...restProps} />
</div>
