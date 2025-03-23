<svelte:options runes />

<script lang="ts">
	import Welcome from '$stories/register/Welcome.svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	const { data }: Props = $props();
</script>

<Welcome username={data.user.username} />
