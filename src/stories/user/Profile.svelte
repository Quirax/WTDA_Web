<svelte:options runes />

<script lang="ts">
	import Header from '$stories/components/Header.svelte';
	import User from 'lucide-svelte/icons/user';

	interface Props extends ReturnType<typeof $props> {
		user: Omit<NonNullable<App.User>, 'id' | 'status'>;
	}

	const { user }: Props = $props();
</script>

<Header title={user.username} />

<img
	src={'https://pbs.twimg.com/profile_banners/761549578210463744/1578316989'}
	alt="{user.username} 님의 헤더 이미지"
	class="w-full aspect-9/1" />

<main class="flex">
	<section class="box-border p-6 w-100">
		<section class="flex justify-center w-full">
			<div class="overflow-hidden border rounded-full w-50 aspect-square">
				{#if user.profileImage}
					<img src={user.profileImage} alt="{user.username} 님의 프로필 이미지" class="size-full" />
				{:else}
					<User class="size-full" />
				{/if}
			</div>
		</section>
		<section>각종 기본 정보</section>
		<section>SNS 및 타 사이트 링크</section>
		<section>사용자 정보 설정 버튼</section>
		<section>남은 슬롯 갯수</section>
		<section>신뢰점수</section>
		<section>문의 가능 시간</section>
		<section>통계(총 작업 수, 평균응답시간)</section>
	</section>
	<section>
		<section>공지사항</section>
		<section>포트폴리오</section>
		<section>커미션 타입</section>
		<section>대기중인 의뢰</section>
	</section>
</main>
