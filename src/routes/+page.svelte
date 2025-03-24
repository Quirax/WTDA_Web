<script lang="ts">
	import { sessionContext, userContext } from '$lib/context';
	import { UserStatus } from '../app';

	import MainPage from '../stories/MainPage.svelte';

	import DocsImage from '../stories/assets/docs.png';
	import ProfileImage from '../stories/assets/profile_example.png';
	import type { PageServerData } from './$types';

	interface Props extends ReturnType<typeof $props> {
		data: PageServerData;
	}

	let { data }: Props = $props();

	userContext.v = data.user;
	sessionContext.v = data.session;
</script>

<MainPage
	recentCommissionTypes={Array(10)
		.fill(undefined)
		.map((_, i) => ({
			thumbnail: DocsImage,
			title: `커미션 ${i + 1}`,
			author: {
				id: 'quiraxical',
				username: 'Quirax Lee',
				profileImage: ProfileImage,
				email: '',
				status: UserStatus.REQUIRED_EMAIL_CONFIRM,
			},
			category: '그림',
			tags: ['이런 태그', '저런 태그', '요런 태그', '이건 잘림'],
		}))}
	recentRequests={Array(10)
		.fill(undefined)
		.map((_, i) => ({
			thumbnail: DocsImage,
			title: `의뢰 ${i + 1}`,
			author: {
				id: 'quiraxical',
				username: 'Quirax Lee',
				profileImage: ProfileImage,
				email: '',
				status: UserStatus.REQUIRED_EMAIL_CONFIRM,
			},
			category: '그림',
			tags: ['이런 태그', '저런 태그', '요런 태그', '이건 잘림'],
		}))}
	introductions={Array(1)
		.fill(undefined)
		.map((_, i) => ({
			src: DocsImage,
			alt: `소개 또는 광고 ${i + 1}`,
		}))} />
