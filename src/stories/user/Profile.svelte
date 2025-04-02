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
		ChevronRight,
	} from 'lucide-svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import sanitizeHtml from 'sanitize-html';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import H2 from '$lib/components/typo/h2.svelte';
	import H3 from '$lib/components/typo/h3.svelte';
	import { durationString, formatDatetimeString } from '$lib/utils';
	import * as Table from '$lib/components/ui/table/index.js';
	import { userStore } from '$lib/context';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import * as Card from '$lib/components/ui/card';
	import DocsImage from '../assets/docs.png';
	import * as Dialog from '$lib/components/ui/dialog';
	import Chart from '$lib/components/chart/chart.svelte';

	interface Props extends ReturnType<typeof $props> {
		user: Omit<NonNullable<App.User>, 'status'>;
		announcements?: App.ProfileAnnouncements;
	}

	const { user, announcements }: Props = $props();

	let me = $state<App.User>(null);
	userStore.subscribe((v) => (me = v));

	let openStatDialog = $state(false);

	const statChartOption: echarts.EChartsOption = {
		tooltip: {
			trigger: 'item',
		},
	};

	// TODO: get values from server
	const maxSlot = 4,
		openedSlot = 3;
	const avgRespTime = 15 * 60 * 1000;
	const numOfCommission = 10,
		avgWorkTime = 7 * 24 * 60 * 60 * 1000,
		completionRatio = 10 / 10;
	const statChartData: echarts.SeriesOption = {
		name: '커미션 수',
		type: 'pie',
		radius: ['40%', '70%'],
		avoidLabelOverlap: false,
		label: {
			show: false,
			position: 'center',
		},
		labelLine: {
			show: false,
		},
		data: [
			{ value: 1048, name: '커미션 1' },
			{ value: 735, name: '커미션 2' },
			{ value: 580, name: '커미션 3' },
		],
	};
</script>

<Header title={user.username} />

<section
	class="aspect-9/1 w-full"
	style="--primary-color: {user.profile.accentColor || 'hsl(var(--primary));'}">
	{#if user.profile.headerImage}
		<img src={user.profile.headerImage} alt="{user.username} 님의 헤더 이미지" class="size-full" />
	{:else}
		<div class="size-full bg-(--primary-color) bg-[url(/background-pattern-banner.png)]"></div>
	{/if}
</section>

<main class="flex" style="--primary-color: {user.profile.accentColor || 'hsl(var(--primary));'}">
	<section class="bg-background relative box-border w-80 flex-none space-y-4 p-6">
		<section class="flex w-full flex-col items-center space-y-2">
			<div class="aspect-square w-30 overflow-hidden rounded-full border">
				{#if user.profileImage}
					<img src={user.profileImage} alt="{user.username} 님의 프로필 이미지" class="size-full" />
				{:else}
					<User class="size-full" />
				{/if}
			</div>
			<H2 class="border-none text-center text-2xl">{user.username}</H2>
		</section>
		<section class="flex">
			<Button class="w-full flex-1 bg-(--primary-color)">
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
			<div class="flex items-center space-x-2">
				<H3 class="inline-block text-xl">남은 슬롯 갯수</H3>
				<Badge class="bg-(--primary-color)">{openedSlot}/{maxSlot}</Badge>
			</div>
			<div class="space-y-2 space-x-2">
				{#each Array(openedSlot)}
					<CircleDashed class="inline size-10 align-top text-green-700" />
				{/each}{#each Array(maxSlot - openedSlot)}
					<CircleCheck class="inline size-10 align-top text-stone-700" />
				{/each}
			</div>
		</section>
		<section class="relative border p-4">
			<H3 class="hidden">통계</H3>
			<Table.Root>
				<Table.Body>
					<Table.Row>
						<Table.Head>총 커미션 수</Table.Head>
						<Table.Cell>{numOfCommission}건</Table.Cell>
					</Table.Row>
					<Table.Row>
						<Table.Head>평균 작업 시간</Table.Head>
						<Table.Cell>{durationString(avgWorkTime)}</Table.Cell>
					</Table.Row>
					<Table.Row>
						<Table.Head>완료율</Table.Head>
						<Table.Cell class="font-bold">{(completionRatio * 100).toFixed(2)}%</Table.Cell>
					</Table.Row>
				</Table.Body>
			</Table.Root>
			<div class="text-right">
				<Button
					variant="link"
					onclick={() => (openStatDialog = true)}
					class="text-(--primary-color)">
					자세히 보기
					<ChevronRight class="size-4" />
				</Button>
			</div>
		</section>
		<section class="space-y-2">
			<H3 class="text-center text-xl">소개</H3>
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
				<H3 class="hidden">링크</H3>
				{#each user.profile.links || [] as link}
					<div>
						<Link class="inline-block size-5 rounded-full bg-(--primary-color) p-0.5 text-white" />
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
		{#if me && me.id === user.id}
			<Button
				size="icon"
				variant="outline"
				class="absolute top-6 right-6 rounded-full"
				aria-label="프로필 수정">
				<Pencil /><!-- Edit Profile -->
			</Button>
		{/if}
	</section>
	<section class="m-4 w-full space-y-8">
		<section class="bg-accent text-accent-foreground flex border p-2">
			<h3 class="flex-none font-bold">공지사항</h3>
			<Separator orientation="vertical" class="mx-2 flex-none" />
			{#if announcements}
				<p class="w-full">
					<Button variant="link" class="text-accent-foreground">{announcements.title}</Button>
					<span class="text-muted-foreground text-sm">
						{formatDatetimeString(announcements.createDate)}
					</span>
				</p>
				<Button variant="link" class="flex-none text-(--primary-color)">
					과거 공지사항 보기
					<ChevronRight class="size-4" />
				</Button>
			{:else}
				<p class="text-muted-foreground w-full italic">등록된 공지사항이 없습니다</p>
			{/if}
			{#if me && me.id === user.id}
				<Separator orientation="vertical" class="mx-2 flex-none" />
				<Button variant="link" class="flex-none text-(--primary-color)">
					<Pencil />새 공지사항 쓰기
				</Button>
			{/if}
		</section>
		<section class="space-y-4">
			<H3>커미션 타입</H3>
			<section class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
				{#each Array(10)
					.fill(undefined)
					.map( (_, i) => ({ thumbnail: DocsImage, title: `커미션 ${i + 1}`, category: '그림', tags: ['이런 태그', '저런 태그', '요런 태그', '이건 잘림'] }), ) as article}
					<Card.Root>
						<img
							src={article?.thumbnail}
							alt={article?.title}
							class="aspect-video w-full object-cover" />
						<Card.Header>
							<Card.Title>{article?.title}</Card.Title>
						</Card.Header>
						<Card.Content>
							<Badge class="m-1 bg-(--primary-color)">#{article?.category}</Badge>
							{#each article?.tags?.slice(0, 3) || [] as tag}
								<Badge class="m-1" variant="secondary">#{tag}</Badge>
							{/each}
						</Card.Content>
					</Card.Root>
				{/each}
			</section>
			<div class="text-right">
				<Button variant="link" class="text-(--primary-color)">
					더 보기
					<ChevronRight class="size-4" />
				</Button>
			</div>
		</section>
		<section class="space-y-4">
			<H3>대기중인 의뢰</H3>
			<section class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
				{#each Array(10)
					.fill(undefined)
					.map( (_, i) => ({ thumbnail: DocsImage, title: `의뢰 ${i + 1}`, category: '그림', tags: ['이런 태그', '저런 태그', '요런 태그', '이건 잘림'] }), ) as article}
					<Card.Root>
						<img
							src={article?.thumbnail}
							alt={article?.title}
							class="aspect-video w-full object-cover" />
						<Card.Header>
							<Card.Title>{article?.title}</Card.Title>
						</Card.Header>
						<Card.Content>
							<Badge class="m-1 bg-(--primary-color)">#{article?.category}</Badge>
							{#each article?.tags?.slice(0, 3) || [] as tag}
								<Badge class="m-1" variant="secondary">#{tag}</Badge>
							{/each}
						</Card.Content>
					</Card.Root>
				{/each}
			</section>
			<div class="text-right">
				<Button variant="link" class="text-(--primary-color)">
					더 보기
					<ChevronRight class="size-4" />
				</Button>
			</div>
		</section>
		<section class="space-y-4">
			<H3>포트폴리오</H3>
			<section class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
				{#each Array(10)
					.fill(undefined)
					.map( (_, i) => ({ thumbnail: DocsImage, title: `포트폴리오 ${i + 1}`, category: '그림', tags: ['이런 태그', '저런 태그', '요런 태그', '이건 잘림'] }), ) as article}
					<Card.Root>
						<img
							src={article?.thumbnail}
							alt={article?.title}
							class="aspect-video w-full object-cover" />
						<Card.Header>
							<Card.Title>{article?.title}</Card.Title>
						</Card.Header>
						<Card.Content>
							<Badge class="m-1 bg-(--primary-color)">#{article?.category}</Badge>
							{#each article?.tags?.slice(0, 3) || [] as tag}
								<Badge class="m-1" variant="secondary">#{tag}</Badge>
							{/each}
						</Card.Content>
					</Card.Root>
				{/each}
			</section>
			<div class="text-right">
				<Button variant="link" class="text-(--primary-color)">
					더 보기
					<ChevronRight class="size-4" />
				</Button>
			</div>
		</section>
	</section>
</main>

<Dialog.Root bind:open={openStatDialog}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>상세 통계</Dialog.Title>
			<Dialog.Description>
				{user.username} 님의 커미션 활동 통계입니다.
			</Dialog.Description>
		</Dialog.Header>
		<Table.Root>
			<Table.Body>
				<Table.Row>
					<Table.Head>총 커미션 수</Table.Head>
					<Table.Cell>{numOfCommission}건</Table.Cell>
				</Table.Row>
				<Table.Row>
					<Table.Head>타입별 커미션 수</Table.Head>
					<Table.Cell>
						<Chart class="size-50" option={statChartOption} series={[statChartData]} />
					</Table.Cell>
				</Table.Row>
				<Table.Row>
					<Table.Head>평균 응답 시간</Table.Head>
					<Table.Cell>{durationString(avgRespTime)}</Table.Cell>
				</Table.Row>
				<Table.Row>
					<Table.Head>평균 작업 시간</Table.Head>
					<Table.Cell>{durationString(avgWorkTime)}</Table.Cell>
				</Table.Row>
				<Table.Row>
					<Table.Head>완료율</Table.Head>
					<Table.Cell class="font-bold">{(completionRatio * 100).toFixed(2)}%</Table.Cell>
				</Table.Row>
			</Table.Body>
		</Table.Root>
	</Dialog.Content>
</Dialog.Root>
