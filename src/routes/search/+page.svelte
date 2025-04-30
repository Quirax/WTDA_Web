<script lang="ts">
	import Search from '$stories/search/Search.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	$inspect(data.params);
</script>

<Search query={data.query} params={data.params} />
