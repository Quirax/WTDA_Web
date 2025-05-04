<script lang="ts">
	import Search from '$stories/search/Search.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<Search
	params={data.params!}
	articles={data.articles}
	count={data.count}
	page={data.page}
	query={data.query} />
