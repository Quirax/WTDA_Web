<script lang="ts">
	import View from '$stories/portfolio/View.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<View article={data.article} />
