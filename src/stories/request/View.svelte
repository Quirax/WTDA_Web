<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { CategoryText, m } from '$lib/messages';
	import { formatDatetimeString, sanitizeHTML } from '$lib/utils';
	import Avatar from '$stories/components/Avatar.svelte';
	import Header from '$stories/components/Header.svelte';
	import Section from '$stories/components/Section.svelte';
	import * as Table from '$lib/components/ui/table/index.js';
	import { H2, H3 } from '$lib/components/typo';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { userStore } from '$lib/context';
	import AlertDialog from '$stories/components/AlertDialog.svelte';
	import { goto, invalidate } from '$app/navigation';
	import Ul from '$lib/components/typo/ul.svelte';
	import { AdultContents, ArticleType, UserRelationship } from '@app';
	import { page } from '$app/state';
	import Tooltip from '$lib/components/tooltip/Tooltip.svelte';
	import { MessageSquare, Share2 } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { deserialize } from '$app/forms';
	import { source } from 'sveltekit-sse';

	interface Props extends ReturnType<typeof $props> {
		article: App.Request;
		relationshipToUser: UserRelationship;
		relationshipFromUser: UserRelationship;
	}

	const { article, relationshipFromUser, relationshipToUser }: Props = $props();

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

	// Article link copy
	const onCopyArticleLink = () => {
		navigator.clipboard.writeText(location.href).then(() => {
			toast.success(m['LINK_COPIED.TITLE']({ item: m['ARTICLE.THIS']() }), {
				description: m['LINK_COPIED.DESCRIPTION'](),
			});
		});
	};

	// DM 시작
	const onBeginDM = async () => {
		const result = await fetch('?/beginDM', { method: 'post', body: new FormData() })
			.then((r) => r.text())
			.then((r) => deserialize(r));

		if (result.type === 'success') {
			const channelId = result.data?.channelId;

			if (channelId) goto(`/dm/${channelId}`);
		} else {
			toast.error(m['ERROR_ALERT.TITLE']({ while: m['DM.WHILE_BEGIN_DM']() }), {
				description: m['ERROR_ALERT.DESCRIPTION'](),
			});
		}
	};

	source('/sse')
		.select('relationshipChanged')
		.subscribe(async (message) => {
			if (!message) return;
			const parsed = JSON.parse(message);

			if (!me) return;

			if (
				!(parsed.fromUser === me.id && parsed.toUser === article.author.id) &&
				!(parsed.toUser === me.id && parsed.fromUser === article.author.id)
			)
				invalidate('r:info');
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
					alt={m['ARTICLE.THUMBNAIL_ALT']({ articleType: ArticleType.REQUEST })} />
			{:else}
				<div class="banner-pattern bg-primary aspect-video w-full"></div>
			{/if}
		</div>
		<section>
			<H3 class="hidden">{m['ARTICLE.DETAILS']({ articleType: ArticleType.REQUEST })}</H3>
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
						<Table.Head>{m['REQUEST.PURPOSE']()}</Table.Head>
						<Table.Cell class="break-all">
							<div>
								{article.purpose}
							</div>
							{#if article.isForCommercial}
								<div class="text-destructive font-bold">{m['REQUEST.FOR_COMMERCIAL']()}</div>
							{/if}
						</Table.Cell>
					</Table.Row>
					<Table.Row>
						<Table.Head>{m['REQUEST.BUDGET']()}</Table.Head>
						<Table.Cell>
							{article.budget
								? article.budget.toLocaleString() + ` ${m['POINT']()}`
								: m['ARTICLE.NEGOTIABLE']()}
						</Table.Cell>
					</Table.Row>
					<Table.Row>
						<Table.Head>{m['REQUEST.DEADLINE']()}</Table.Head>
						<Table.Cell>
							{article.deadline
								? formatDatetimeString(article.deadline)
								: m['ARTICLE.NEGOTIABLE']()}
						</Table.Cell>
					</Table.Row>
				</Table.Body>
			</Table.Root>
		</section>
		{#if me && article.author.id !== me.id}
			<section class="flex">
				<Tooltip
					class="w-full"
					text={m['DM.UNABLE_TO_DM_WHEN_BLOCKED']()}
					disabled={relationshipFromUser !== UserRelationship.BLOCKED &&
						relationshipToUser !== UserRelationship.BLOCKED}>
					{#snippet child({ props })}
						<div {...props} class="w-full">
							<Button
								class="w-full flex-1"
								onclick={onBeginDM}
								disabled={relationshipFromUser === UserRelationship.BLOCKED ||
									relationshipToUser === UserRelationship.BLOCKED}>
								<MessageSquare />
								{m['DM.BEGIN_DM_ABOUT']({ articleType: ArticleType.REQUEST })}
							</Button>
						</div>
					{/snippet}
				</Tooltip>
				<Button size="icon" variant="outline" onclick={onCopyArticleLink}><Share2 /></Button>
				<!-- TODO 구현 완료 시 재활성화
				<DropdownMenu.Root>
					<DropdownMenu.Trigger class="m-0 p-0">
						{#snippet child({ props })}
							<Button {...props} variant="outline" size="icon"><EllipsisVertical /></Button>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content class="w-56" align="end">
						<DropdownMenu.Item onclick={() => {}}>{m['REPORT']()}</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
						-->
			</section>
		{/if}
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
				<Button href="/r/{article.id}/edit">{m['ARTICLE.EDIT']()}</Button>
				<Button variant="destructive" onclick={() => (openBeforeDeletionAlert = true)}>
					{m['ARTICLE.DELETE']()}
				</Button>
			</section>
		{/if}
	</section>
</Section>

{#snippet deleteDesc()}
	<Ul>
		<li>{m['ARTICLE.BEFORE_DELETE_ALERT.DESCRIPTION']()}</li>
		<li>
			{m['ARTICLE.BEFORE_DELETE_ALERT.DESCRIPTION_COMMISSION']({
				articleType: ArticleType.REQUEST,
			})}
		</li>
	</Ul>
{/snippet}

<AlertDialog
	title={m['ARTICLE.BEFORE_DELETE_ALERT.TITLE']()}
	description={deleteDesc}
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
