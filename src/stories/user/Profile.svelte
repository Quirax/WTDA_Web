<svelte:options runes />

<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import Header from '$stories/components/Header.svelte';
	import Share2 from 'lucide-svelte/icons/share-2';
	import User from 'lucide-svelte/icons/user';
	import EllipsisVertical from 'lucide-svelte/icons/ellipsis-vertical';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';

	interface Props extends ReturnType<typeof $props> {
		user: Omit<NonNullable<App.User>, 'id' | 'status'>;
	}

	const { user }: Props = $props();
</script>

<Header title={user.username} />

<section class="aspect-9/1 w-full">
	{#if user.profile.headerImage}
		<img src={user.profile.headerImage} alt="{user.username} 님의 헤더 이미지" class="size-full" />
	{:else}
		<div class="bg-primary size-full bg-[url(/background-pattern-banner.png)]"></div>
	{/if}
</section>

<main class="flex">
	<section class="box-border w-100 space-y-4 p-6">
		<section>사용자 정보 설정 버튼</section>
		<section class="flex w-full justify-center">
			<div class="aspect-square w-50 overflow-hidden rounded-full border">
				{#if user.profileImage}
					<img src={user.profileImage} alt="{user.username} 님의 프로필 이미지" class="size-full" />
				{:else}
					<User class="size-full" />
				{/if}
			</div>
		</section>
		<h2 class="text-center text-2xl font-bold">{user.username}</h2>
		<section class="flex">
			<div class="flex-1">
				<Button class="w-full text-lg">메시지하기</Button>
				<div>(+ 문의 가능 시간, 평균 응답 시간)</div>
			</div>
			<Button size="icon" variant="outline"><Share2 /></Button>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger class="m-0 p-0">
					{#snippet child({ props })}
						<Button {...props} variant="outline" size="icon"><EllipsisVertical /></Button>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content class="w-56" align="end">
					<DropdownMenu.Item onclick={() => {}}>차단하기</DropdownMenu.Item>
					<DropdownMenu.Item onclick={() => {}}>신고하기</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</section>
		<section>남은 슬롯 갯수</section>
		<section>통계(신뢰점수, 총 작업 수, 총 커미션 취소 건수)</section>
		<section>소개</section>
		<section>SNS 및 타 사이트 링크</section>
	</section>
	<section>
		<section>공지사항</section>
		<section>포트폴리오</section>
		<section>커미션 타입</section>
		<section>대기중인 의뢰</section>
	</section>
</main>
