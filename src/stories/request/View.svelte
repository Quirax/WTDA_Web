<script lang="ts">
	import H2 from '$lib/components/typo/h2.svelte';
	import { Button } from '$lib/components/ui/button';
	import { CategoryText } from '$lib/messages';
	import { sanitizeHTML } from '$lib/utils';
	import Avatar from '$stories/components/Avatar.svelte';
	import Header from '$stories/components/Header.svelte';
	import Section from '$stories/components/Section.svelte';

	interface Props extends ReturnType<typeof $props> {
		article: App.Request;
	}

	const { article }: Props = $props();
</script>

<Header title={article.title} />

<Section class="flex space-x-4">
	<div class="flex-auto">
		<H2>{article.title}</H2>
		<article class="html p-4">
			{#if article.content}
				{@html sanitizeHTML(article.content)}
			{:else}
				<span class="italic">세부 내용이 없습니다.</span>
			{/if}
		</article>
		<span>{article.tags}</span>
	</div>
	<div class="w-80 flex-none space-y-2 border p-4">
		<div>
			{#if article.thumbnail}<img
					src={article.thumbnail}
					class="aspect-video w-full"
					alt="이 의뢰의 썸네일" />{/if}
		</div>
		<div>
			<Button variant="link" class="text-inherit" href="/user/{article.author.id}">
				<Avatar class="inline-block h-6 w-6 align-middle" user={article.author} />
				{article.author.username}
			</Button>
		</div>
		<span>{article.budget || '협의 가능'}</span>
		<span>{CategoryText[article.category]()}</span>
		<span>{article.containsAdultContents && '성인물'}</span>
		<span>{article.createDate}</span>
		<span>{article.deadline || '협의 가능'}</span>
		<span>
			{#if article.isForCommercial}ㅁㄴㅇㄹ{/if}
		</span>
		<span>{article.modifyDate}</span>
		<span>{article.purpose}</span>
	</div>
</Section>
