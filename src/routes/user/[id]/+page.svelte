<script lang="ts">
	import Profile from '$stories/user/Profile.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<!--
공지사항 테스트 시 아래의 목업 사용

```
|| {
		id: 'asdf',
		userId: data.user.id,
		title: '오늘의 공지사항입니다!',
		content: '아무말 대잔치중',
		createDate: new Date(),
	}
```
-->

<Profile
	user={data.user}
	announcements={data.profileAnnouncements || {
		id: 'asdf',
		userId: data.user.id,
		title: '오늘의 공지사항입니다!',
		content: '아무말 대잔치중',
		createDate: new Date(),
	}} />
