<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { CategoryText, m } from '$lib/messages';
	import { cn, formatDateString, formatDatetimeString, sanitizeHTML } from '$lib/utils';
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
	import { AdultContents, ArticleType } from '@app';
	import { page } from '$app/state';
	import * as Card from '$lib/components/ui/card';
	import * as Carousel from '$lib/components/ui/carousel';
	import type { CarouselAPI } from '$lib/components/ui/carousel/context';
	import MediaGallery from '$stories/components/MediaGallery.svelte';
	import { toast } from 'svelte-sonner';

	interface Props extends ReturnType<typeof $props> {
		article: App.Portfolio;
	}

	const { article }: Props = $props();

	let me = $state<App.User>(null);
	userStore.subscribe((v) => (me = v));

	// 삭제
	let openBeforeDeletionAlert = $state(false);
	let openAfterDeletionAlert = $state(false);

	const onDelete = async () => {
		const result = await fetch('?/delete', {
			method: 'post',
			body: new FormData(),
		}).then((r) => r.json());

		if ([200, 204].indexOf(result.status || 0) === -1) {
			if (result.status !== 302)
				toast.error(m['ERROR_ALERT.TITLE']({ while: m['ARTICLE.WHILE']() }), {
					description: m['ERROR_ALERT.DESCRIPTION'](),
				});
			return;
		}

		openAfterDeletionAlert = true;
	};
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

		{#if article.media.length > 0}
			<MediaGallery
				media={article.media.map((src, idx) => ({
					src,
					alt: m['ARTICLE.MEDIA_ALT']({ idx: idx + 1 }),
				}))} />
		{/if}

		<article class="html p-4">
			{#if article.content}
				{@html sanitizeHTML(article.content)}
			{:else}
				<span class="italic">{m['ARTICLE.NO_CONTENT']()}</span>
			{/if}
		</article>
		<div class="border-t pt-2">
			{#each article.tags.slice(0, 3) || [] as tag}
				<Badge class="m-1" variant="default">#{tag}</Badge>
			{/each}
		</div>
	</section>
	<section class="flex-none space-y-2 border p-4 max-lg:mt-8 lg:w-80">
		<div>
			{#if article.thumbnail}
				<img
					src={article.thumbnail}
					class="aspect-video w-full object-cover"
					alt={m['ARTICLE.THUMBNAIL_ALT']({ articleType: ArticleType.PORTFOLIO })} />
			{:else}
				<div class="banner-pattern bg-primary aspect-video w-full"></div>
			{/if}
		</div>
		<section>
			<H3 class="hidden">{m['ARTICLE.DETAILS']({ articleType: ArticleType.PORTFOLIO })}</H3>
			<Table.Root class="table-fixed">
				<Table.Body>
					<Table.Row>
						<Table.Head class="w-[8em]">{m['ARTICLE.AUTHOR']()}</Table.Head>
						<Table.Cell>
							<Button variant="link" class="text-inherit" href="/user/{article.author.id}">
								<Avatar
									class="inline-block h-6 w-6 align-middle"
									user={article.author}
									withoutLink />
								{article.author.username}
							</Button>
						</Table.Cell>
					</Table.Row>
					<Table.Row>
						<Table.Head>{m['ARTICLE.CATEGORY']()}</Table.Head>
						<Table.Cell>{CategoryText[article.category]()}</Table.Cell>
					</Table.Row>
					<Table.Row>
						<Table.Head>{m['PORTFOLIO.PUBLISH_DATE']()}</Table.Head>
						<Table.Cell>
							{article.publishDate
								? formatDateString(article.publishDate)
								: m['PORTFOLIO.PUBLISH_DATE_UNKNOWN']()}
						</Table.Cell>
					</Table.Row>
				</Table.Body>
			</Table.Root>
		</section>
		<section>
			<H3>{m['ARTICLE.MISC_INFO']()}</H3>
			<Table.Root>
				<Table.Body>
					<Table.Row>
						<Table.Head>{m['ARTICLE.CREATE_DATE']()}</Table.Head>
						<Table.Cell>
							{formatDatetimeString(article.createDate)}
						</Table.Cell>
					</Table.Row>
					<Table.Row>
						<Table.Head>{m['ARTICLE.MODIFY_DATE']()}</Table.Head>
						<Table.Cell>{formatDatetimeString(article.modifyDate)}</Table.Cell>
					</Table.Row>
				</Table.Body>
			</Table.Root>
		</section>
		{#if me && article.author.id === me.id}
			<section class="text-right">
				<Button href="/pf/{article.id}/edit">{m['ARTICLE.EDIT']()}</Button>
				<Button variant="destructive" onclick={() => (openBeforeDeletionAlert = true)}>
					{m['ARTICLE.DELETE']()}
				</Button>
			</section>
		{/if}
	</section>
</Section>

<AlertDialog
	title={m['ARTICLE.BEFORE_DELETE_ALERT.TITLE']()}
	description={m['ARTICLE.BEFORE_DELETE_ALERT.DESCRIPTION']()}
	cancel={true}
	onAction={onDelete}
	bind:open={openBeforeDeletionAlert} />

<AlertDialog
	title={m['ARTICLE.AFTER_DELETE_ALERT.TITLE']()}
	description={m['ARTICLE.AFTER_DELETE_ALERT.DESCRIPTION']()}
	onAction={() => {
		goto('/');
	}}
	bind:open={openAfterDeletionAlert} />
