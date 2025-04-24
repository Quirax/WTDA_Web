<script lang="ts">
	import H2 from '$lib/components/typo/h2.svelte';
	import { Button } from '$lib/components/ui/button';
	import { CategoryText } from '$lib/messages';
	import Avatar from '$stories/components/Avatar.svelte';
	import Header from '$stories/components/Header.svelte';
	import Section from '$stories/components/Section.svelte';

	interface Props extends ReturnType<typeof $props> {
		article: App.Request;
	}

	const { article }: Props = $props();
</script>

<Header title={article.title} />

<Section class="flex">
	<div>
		<H2>{article.title}</H2>
		<span>{article.content}</span>
		<span>{article.tags}</span>
	</div>
	<div class="w-80 flex-none">
		<span>
			{#if article.thumbnail}{article.thumbnail}{/if}
		</span>
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
