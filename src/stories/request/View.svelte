<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { CategoryText } from '$lib/messages';
	import { formatDatetimeString, sanitizeHTML } from '$lib/utils';
	import Avatar from '$stories/components/Avatar.svelte';
	import Header from '$stories/components/Header.svelte';
	import Section from '$stories/components/Section.svelte';
	import * as Table from '$lib/components/ui/table/index.js';
	import { H2, H3 } from '$lib/components/typo';

	interface Props extends ReturnType<typeof $props> {
		article: App.Request;
	}

	const { article }: Props = $props();
</script>

<Header title={article.title} />

<Section class="flex space-x-4">
	<section class="flex-auto">
		<H2>{article.title}</H2>
		<article class="html p-4">
			{#if article.content}
				{@html sanitizeHTML(article.content)}
			{:else}
				<span class="italic">세부 내용이 없습니다.</span>
			{/if}
		</article>
		<span>{article.tags}</span>
	</section>
	<section class="w-80 flex-none space-y-2 border p-4">
		<div>
			{#if article.thumbnail}<img
					src={article.thumbnail}
					class="aspect-video w-full"
					alt="이 의뢰의 썸네일" />{/if}
		</div>
		<section>
			<H3 class="hidden">의뢰 기본 정보</H3>
			<Table.Root>
				<Table.Body>
					<Table.Row>
						<Table.Head>작성자</Table.Head>
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
						<Table.Cell>
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
	</section>
</Section>
