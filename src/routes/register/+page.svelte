<svelte:options runes />

<script lang="ts">
	import type { PageData } from './$types';
	import Register from '../../stories/register/Register.svelte';
	import type { HTMLSlotAttributes } from 'svelte/elements';

	interface Props extends HTMLSlotAttributes {
		data: PageData;
	}

	const { data }: Props = $props();
</script>

<Register data={data.form} />
