<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Avatar from './Avatar.svelte';
	import { ArticleTypeText, CategoryText } from '$lib/messages';
	import tinycolor from 'tinycolor2';
	import { ArticleType } from '@app';

	interface Props extends ReturnType<typeof $props> {
		articles: App.Articles[];
		hideAuthor?: boolean;
		accentColor?: string;
	}

	const { articles, hideAuthor = false, style, accentColor, ...restProps }: Props = $props();

	const patternTinycolor = $derived(tinycolor(accentColor || 'hsl(29.52 83% 25%)'));
	const patternColor = $derived(
		patternTinycolor.getBrightness() > 127
			? patternTinycolor.darken(7.7).toHexString()
			: patternTinycolor.brighten(7.7).toHexString(),
	);

	const getLinkPrefix = (type: ArticleType) => {
		switch (type) {
			case ArticleType.REQUEST:
				return 'r';
		}
	};
</script>

<section style="--primary-color: {accentColor || 'hsl(var(--primary));'} {style}" {...restProps}>
	{#each articles as article}
		<Card.Root>
			{#if article?.thumbnail}
				<img
					src={article?.thumbnail}
					alt={article?.title}
					class="aspect-video w-full object-cover" />
			{:else}
				<div
					class="banner-pattern aspect-video w-full bg-(--primary-color)"
					style={`--pattern-color: ${patternColor};`}>
				</div>
			{/if}
			<Card.Header>
				{#if article?.type}
					<div>
						<Badge class="m-1 bg-(--primary-color) hover:bg-(--primary-color)/90">
							{ArticleTypeText[article?.type]()}
						</Badge>
					</div>
				{/if}
				<Card.Title>
					{#if article?.type}
						<Button
							variant="link"
							class="text-[length:inherit] leading-[inherit] font-[weight:inherit]! text-inherit"
							href="/{getLinkPrefix(article.type)}/{article?.id}">
							{article?.title}
						</Button>
					{:else}
						{article?.title}
					{/if}
				</Card.Title>
				{#if !hideAuthor}
					<Card.Description class="text-right">
						by
						<Button variant="link" class="text-inherit" href="/user/{article?.author.id}">
							<Avatar class="inline-block h-6 w-6 align-middle" user={article?.author} />
							{article?.author.username}
						</Button>
					</Card.Description>
				{/if}
			</Card.Header>
			<Card.Content>
				<Badge class="m-1 bg-(--primary-color) hover:bg-(--primary-color)/90">
					#{CategoryText[article?.category]()}
				</Badge>
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
