<script lang="ts">
	import MainPage from '../stories/MainPage.svelte';

	import DocsImage from '../stories/assets/docs.png';
	import ProfileImage from '../stories/assets/profile_example.png';

	let user = $state<App.User>();
</script>

<MainPage
	{user}
	onLogin={() =>
		(user = {
			id: 'quiraxical',
			username: 'Quirax Lee',
			fallbackInitial: 'QR',
			profileImage: null,
		})}
	onLogout={() => (user = undefined)}
	commissionTypes={Array(10)
		.fill(undefined)
		.map<App.CommisionType>(
			(_, i) =>
				({
					thumbnail: DocsImage,
					title: `커미션 ${i + 1}`,
					author: {
						id: 'quiraxical',
						username: 'Quirax Lee',
						fallbackInitial: 'QR',
						profileImage: ProfileImage,
					},
					category: '그림',
					tags: ['이런 태그', '저런 태그', '요런 태그', '이건 잘림'],
				}) as App.CommisionType,
		)}
	requests={Array(10)
		.fill(undefined)
		.map<App.Request>(
			(_, i) =>
				({
					thumbnail: DocsImage,
					title: `의뢰 ${i + 1}`,
					author: {
						id: 'quiraxical',
						username: 'Quirax Lee',
						fallbackInitial: 'QR',
						profileImage: ProfileImage,
					},
					category: '그림',
					tags: ['이런 태그', '저런 태그', '요런 태그', '이건 잘림'],
				}) as App.Request,
		)} />
