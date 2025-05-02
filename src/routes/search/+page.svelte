<script lang="ts">
	import Search from '$stories/search/Search.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	$inspect(data.articles);
</script>

<Search params={data.params!} articles={data.articles} />
