<script lang="ts">
	import { ArticleCategory, UserStatus } from '../app';

	import MainPage from '../stories/MainPage.svelte';

	import DocsImage from '../stories/assets/docs.png';
	import ProfileImage from '../stories/assets/profile_example.png';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<MainPage
	recentCommissionTypes={[]}
	recentRequests={data.requests}
	introductions={Array(1)
		.fill(undefined)
		.map((_, i) => ({
			src: DocsImage,
			alt: `소개 또는 광고 ${i + 1}`,
		}))} />
