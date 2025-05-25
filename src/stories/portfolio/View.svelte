<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { CategoryText } from '$lib/messages';
	import { cn, formatDatetimeString, sanitizeHTML } from '$lib/utils';
	import Avatar from '$stories/components/Avatar.svelte';
	import Header from '$stories/components/Header.svelte';
	import Section from '$stories/components/Section.svelte';
	import * as Table from '$lib/components/ui/table/index.js';
	import { H2, H3 } from '$lib/components/typo';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { userStore } from '$lib/context';
	import AlertDialog from '$stories/components/AlertDialog.svelte';
	import { goto } from '$app/navigation';
	import Ul from '$lib/components/typo/ul.svelte';
	import { AdultContents } from '@app';
	import { page } from '$app/state';
	import * as Card from '$lib/components/ui/card';
	import * as Carousel from '$lib/components/ui/carousel';
	import type { CarouselAPI } from '$lib/components/ui/carousel/context';

	interface Props extends ReturnType<typeof $props> {
		article: App.Portfolio;
	}

	const { article }: Props = $props();

	let me = $state<App.User>(null);
	userStore.subscribe((v) => (me = v));

	let openErrorAlert = $state(false);

	// 삭제
	let openBeforeDeletionAlert = $state(false);
	let openAfterDeletionAlert = $state(false);

	const onDelete = async () => {
		const result = await fetch('?/delete', {
			method: 'post',
			body: new FormData(),
		}).then((r) => r.json());

		if ([200, 204].indexOf(result.status || 0) === -1) {
			if (result.status !== 302) openErrorAlert = true;
			return;
		}

		openAfterDeletionAlert = true;
	};

	let api = $state<CarouselAPI>();
	let current = $state(0);

	$effect(() => {
		if (api) {
			current = api.selectedScrollSnap();
			api.on('select', () => {
				current = api!.selectedScrollSnap();
			});
		}
	});
</script>

<svelte:head>
	{#if article.containsAdultContents !== AdultContents.NORMAL}
		<!-- 「청소년 유해매체물의 표시방법」(방송통신위원회고시 제2015-17호)에 따른 전자적 표시 -->
		{/* @ts-ignore */ null}
		<!-- prettier-ignore -->
		<meta http-equiv="PICS-label" content='(PICS-1.1 "http://service.kosec.or.kr/rating.html" l gen false for "{page.url}" r (y 1))' />
	{/if}
</svelte:head>

<Header title={article.title} />

<Section class="flex space-x-4 max-lg:flex-col">
	<section class="flex-auto">
		<H2>{article.title}</H2>
		<!-- media -->
		{#if article.media.length > 0}
			<section class="relative my-4 flex justify-center px-17">
				<Carousel.Root
					class="align-center h-[50vh] max-w-full"
					opts={{ loop: true }}
					setApi={(emblaApi) => (api = emblaApi)}>
					<Carousel.Previous />
					<Carousel.Content class="w-full">
						{#each article.media as media, idx}
							<Carousel.Item>
								<div class="flex h-[50vh] items-center justify-center p-1">
									<Card.Root class="size-full">
										<img class="size-full object-contain" src={media} alt="첨부 미디어 {idx + 1}" />
									</Card.Root>
								</div>
							</Carousel.Item>
						{/each}
					</Carousel.Content>
					<Carousel.Next />
				</Carousel.Root>
			</section>
			<div class="flex w-full justify-center">
				<Carousel.Root class="align-center" opts={{ loop: true, align: 'start' }}>
					<Carousel.Content class="w-44 md:w-88 lg:w-132 xl:w-176 2xl:w-220">
						{#each article.media as media, idx}
							<Carousel.Item
								class="relative aspect-square h-40 md:basis-1/2 lg:basis-1/3 xl:basis-1/4 2xl:basis-1/5">
								<div class="size-full p-1">
									<Card.Root class={cn('size-full', idx === current && 'border-primary border-3')}>
										<img class="size-full object-cover" src={media} alt="첨부 미디어 {idx + 1}" />
									</Card.Root>
								</div>
							</Carousel.Item>
						{/each}
					</Carousel.Content>
					<Carousel.Previous />
					<Carousel.Next />
				</Carousel.Root>
			</div>
		{/if}
		<article class="html p-4">
			{#if article.content}
				{@html sanitizeHTML(article.content)}
			{:else}
				<span class="italic">세부 내용이 없습니다.</span>
			{/if}
		</article>
		<div class="border-t pt-2">
			{#each article.tags.slice(0, 3) || [] as tag}
				<Badge class="m-1" variant="default">#{tag}</Badge>
			{/each}
		</div>
	</section>
	<section class="flex-none space-y-2 border p-4 max-md:mt-8 md:w-80">
		<div>
			{#if article.thumbnail}
				<img
					src={article.thumbnail}
					class="aspect-video w-full object-cover"
					alt="이 의뢰의 썸네일" />
			{:else}
				<div class="banner-pattern bg-primary aspect-video w-full"></div>
			{/if}
		</div>
		<section>
			<H3 class="hidden">의뢰 기본 정보</H3>
			<Table.Root class="table-fixed">
				<Table.Body>
					<Table.Row>
						<Table.Head class="w-[8em]">작성자</Table.Head>
						<Table.Cell>
							<Button variant="link" class="text-inherit" href="/user/{article.author.id}">
								<Avatar class="inline-block h-6 w-6 align-middle" user={article.author} />
								{article.author.username}
							</Button>
						</Table.Cell>
					</Table.Row>
					<Table.Row>
						<Table.Head>카테고리</Table.Head>
						<Table.Cell>{CategoryText[article.category]()}</Table.Cell>
					</Table.Row>
					<Table.Row>
						<Table.Head>작업 및 게시 일자</Table.Head>
						<Table.Cell>
							{article.publishDate ? formatDatetimeString(article.publishDate) : '미상'}
						</Table.Cell>
					</Table.Row>
				</Table.Body>
			</Table.Root>
		</section>
		<section>
			<H3>기타 정보</H3>
			<Table.Root>
				<Table.Body>
					<Table.Row>
						<Table.Head>작성일시</Table.Head>
						<Table.Cell>
							{formatDatetimeString(article.createDate)}
						</Table.Cell>
					</Table.Row>
					<Table.Row>
						<Table.Head>수정일시</Table.Head>
						<Table.Cell>{formatDatetimeString(article.modifyDate)}</Table.Cell>
					</Table.Row>
				</Table.Body>
			</Table.Root>
		</section>
		{#if me && article.author.id === me.id}
			<section class="text-right">
				<Button href="/pf/{article.id}/edit">수정하기</Button>
				<Button variant="destructive" onclick={() => (openBeforeDeletionAlert = true)}>
					삭제하기
				</Button>
			</section>
		{/if}
	</section>
</Section>

{#snippet deleteDesc()}
	<Ul>
		<li>삭제한 게시물은 복구할 수 없습니다.</li>
		<li>
			이 의뢰와 관련된 커미션이 진행중인 경우 삭제할 수 없습니다. 커미션을 중단한 후 다시
			시도하세요.
		</li>
	</Ul>
{/snippet}

<AlertDialog
	title="정말로 삭제하시겠습니까?"
	description={deleteDesc}
	cancel={true}
	onAction={onDelete}
	bind:open={openBeforeDeletionAlert} />

<AlertDialog
	title="삭제 완료"
	description="게시물을 삭제하였습니다"
	onAction={() => {
		goto('/');
	}}
	bind:open={openAfterDeletionAlert} />

<AlertDialog
	title="게시물 관련 처리 도중 오류가 발생하였습니다"
	description="고객센터에 문의하시기 바랍니다다"
	bind:open={openErrorAlert} />
