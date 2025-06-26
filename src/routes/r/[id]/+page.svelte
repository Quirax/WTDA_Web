<script lang="ts">
	import View from '$stories/request/View.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<View
	article={data.article}
	relationshipToUser={data.relationshipToUser}
	relationshipFromUser={data.relationshipFromUser} />
