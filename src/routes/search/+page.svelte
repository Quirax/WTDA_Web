<script lang="ts">
	import Search from '$stories/search/Search.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	$inspect(data.count);
</script>

<Search params={data.params!} articles={data.articles} count={data.count} />
