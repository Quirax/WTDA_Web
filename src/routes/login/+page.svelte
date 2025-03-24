<svelte:options runes />

<script lang="ts">
	import type { PageData } from './$types';

	import Login from '$stories/login/Login.svelte';

	interface Props {
		data: PageData;
	}

	const { data }: Props = $props();
</script>

<Login data={data.form} />
