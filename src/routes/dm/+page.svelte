<script lang="ts">
	import List from '$stories/dm/List.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<List />
