<script lang="ts">
	import { ArticleCategory, UserStatus } from '../app';

	import MainPage from '../stories/MainPage.svelte';

	import DocsImage from '../stories/assets/docs.png';
	import ProfileImage from '../stories/assets/profile_example.png';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<MainPage
	recentCommissionTypes={Array(10)
		.fill(undefined)
		.map((_, i) => ({
			id: 'asdf',
			thumbnail: DocsImage,
			title: `커미션 ${i + 1}`,
			author: {
				id: 'quiraxical',
				username: 'Quirax Lee',
				profileImage: ProfileImage,
				email: '',
				status: UserStatus.REQUIRED_EMAIL_CONFIRM,
				preferences: {},
				profile: {},
			},
			category: ArticleCategory.DRAWING,
			tags: ['이런 태그', '저런 태그', '요런 태그', '이건 잘림'],
		}))}
	recentRequests={data.requests}
	introductions={Array(1)
		.fill(undefined)
		.map((_, i) => ({
			src: DocsImage,
			alt: `소개 또는 광고 ${i + 1}`,
		}))} />
