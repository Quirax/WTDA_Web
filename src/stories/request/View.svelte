<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { CategoryText } from '$lib/messages';
	import { formatDatetimeString, sanitizeHTML } from '$lib/utils';
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

	interface Props extends ReturnType<typeof $props> {
		article: App.Request;
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
</script>

<Header title={article.title} />

<Section class="flex space-x-4 max-md:flex-col">
	<section class="flex-auto">
		<H2>{article.title}</H2>
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
				<img src={article.thumbnail} class="aspect-video w-full" alt="이 의뢰의 썸네일" />
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
						<Table.Head>사용 목적</Table.Head>
						<Table.Cell class="break-all">
							<div>
								{article.purpose}
							</div>
							{#if article.isForCommercial}
								<div class="text-destructive font-bold">(상업적 목적으로 사용)</div>
							{/if}
						</Table.Cell>
					</Table.Row>
					<Table.Row>
						<Table.Head>가능한 금액</Table.Head>
						<Table.Cell>
							{article.budget ? article.budget.toLocaleString() + ' 포인트' : '협의 가능'}
						</Table.Cell>
					</Table.Row>
					<Table.Row>
						<Table.Head>작업 기한</Table.Head>
						<Table.Cell>
							{article.deadline ? formatDatetimeString(article.deadline) : '협의 가능'}
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
				<Button href="/r/{article.id}/edit">수정하기</Button>
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
