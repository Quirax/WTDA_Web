<svelte:options runes />

<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import Header from '$stories/components/Header.svelte';
	import {
		Share2,
		User,
		EllipsisVertical,
		Pencil,
		CircleCheck,
		MessageSquare,
		Clock,
		Link,
		CircleDashed,
	} from 'lucide-svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import sanitizeHtml from 'sanitize-html';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import H2 from '$lib/components/typo/h2.svelte';
	import H3 from '$lib/components/typo/h3.svelte';
	import { durationString } from '$lib/utils';

	interface Props extends ReturnType<typeof $props> {
		user: Omit<NonNullable<App.User>, 'id' | 'status'>;
	}

	const { user }: Props = $props();

	// TODO: get values from server
	const maxSlot = 4,
		openedSlot = 3;
	const avgRespTime = 15 * 60 * 1000;
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
	<section class="relative box-border w-100 space-y-4 p-6">
		<Button size="icon" variant="outline" class="absolute top-6 right-6 rounded-full">
			<Pencil /><!-- Edit Profile -->
		</Button>
		<section class="flex w-full justify-center">
			<div class="aspect-square w-50 overflow-hidden rounded-full border">
				{#if user.profileImage}
					<img src={user.profileImage} alt="{user.username} 님의 프로필 이미지" class="size-full" />
				{:else}
					<User class="size-full" />
				{/if}
			</div>
		</section>
		<H2 class="border-none text-center">{user.username}</H2>
		<section class="flex">
			<Button class="w-full flex-1 text-lg">
				<MessageSquare />
				메시지하기
			</Button>
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
		<Alert.Root>
			<Clock class="size-4" />
			<Alert.Title>
				문의 가능 시간:
				{#if !user.profile.contactAvailable}
					미설정
				{:else if typeof user.profile.contactAvailable === 'boolean'}
					상시
				{:else}
					{user.profile.contactAvailable.from}시 ~ {user.profile.contactAvailable.to}시
				{/if}
			</Alert.Title>
			<Alert.Description>평균 응답 시간: {durationString(avgRespTime)}</Alert.Description>
		</Alert.Root>
		<section class="space-y-2">
			<div>
				<H3 class="inline-block">남은 슬롯 갯수</H3>
				<span>{openedSlot}/{maxSlot}</span>
			</div>
			<div class="space-y-2 space-x-2">
				{#each Array(openedSlot)}
					<CircleDashed class="inline size-10 align-top text-green-700" />
				{/each}{#each Array(maxSlot - openedSlot)}
					<CircleCheck class="inline size-10 align-top text-stone-700" />
				{/each}
			</div>
		</section>
		<section>통계(신뢰점수, 총 작업 수, 총 커미션 취소 건수)</section>
		<section class="space-y-2">
			<H3 class="text-center">소개</H3>
			<article class="border p-4">
				{#if user.profile.introduction}
					{@html sanitizeHtml(user.profile.introduction)}
				{:else}
					<span class="italic">자기소개가 없습니다.</span>
				{/if}
			</article>
		</section>
		{#if (user.profile.links || []).length > 0}
			<section class="grid grid-cols-2 gap-2 border p-4">
				<!-- 링크 -->
				{#each user.profile.links || [] as link}
					<div>
						<Link class="bg-primary inline-block size-5 rounded-full p-0.5 text-white" />
						<Button
							variant="link"
							href={link.href}
							target={link.target}
							class="text-md text-foreground align-middle">
							{link.text}
						</Button>
					</div>
				{/each}
			</section>
		{/if}
	</section>
	<section>
		<section>공지사항</section>
		<section>포트폴리오</section>
		<section>커미션 타입</section>
		<section>대기중인 의뢰</section>
	</section>
</main>
