<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Avatar from './Avatar.svelte';
	import { ArticleTypeText, CategoryText } from '$lib/messages';
	import tinycolor from 'tinycolor2';
	import { AdultContents, ArticleType } from '@app';
	import { cn } from '$lib/utils';

	interface Props extends ReturnType<typeof $props> {
		articles: App.Articles[];
		hideAuthor?: boolean;
		accentColor?: string;
		hideMore?: boolean;
	}

	const {
		articles,
		hideAuthor = false,
		style,
		accentColor,
		hideMore = false,
		...restProps
	}: Props = $props();

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
			{@const href = article.type ? `/${getLinkPrefix(article.type)}/${article?.id}` : ''}
			<a {href}>
				{#if article?.thumbnail}
					<img
						src={article?.thumbnail}
						alt={article?.title}
						class={cn(
							'aspect-video w-full object-cover',
							article?.containsAdultContents &&
								article?.containsAdultContents !== AdultContents.NORMAL &&
								'blur-sm',
						)} />
				{:else}
					<div
						class="banner-pattern aspect-video w-full bg-(--primary-color)"
						style={`--pattern-color: ${patternColor};`}>
					</div>
				{/if}
			</a>
			<Card.Header>
				{#if article?.type}
					<div class="my-2 space-x-1">
						<Badge class="bg-(--primary-color) hover:bg-(--primary-color)/90">
							{ArticleTypeText[article?.type]()}
						</Badge>
						{#if article?.containsAdultContents}
							{#if article.containsAdultContents === AdultContents.ADULT_RESTRICTED}
								<Badge class="bg-destructive hover:bg-destructive/90">성인 콘텐츠</Badge>
							{:else if article.containsAdultContents === AdultContents.GROTESQUE_RESTRICTED}
								<Badge class="bg-destructive hover:bg-destructive/90">잔인한 콘텐츠</Badge>
							{/if}
						{/if}
					</div>
				{/if}
				<Card.Title class="overflow-hidden">
					{#if article?.type}
						<Button
							variant="link"
							class="text-[length:inherit] leading-[inherit] font-[weight:inherit]! text-inherit"
							{href}>
							{article?.title}
							<!-- TODO: tooltip으로 전체 제목 표시 -->
						</Button>
					{:else}
						{article?.title}
					{/if}
				</Card.Title>
				{#if !hideAuthor}
					<Card.Description class="flex items-center justify-end space-x-2">
						<span>by</span>
						<Button variant="link" class="text-inherit" href="/user/{article?.author.id}">
							<Avatar class="inline-block h-6 w-6 align-middle" user={article?.author} />
							{article?.author.username}
						</Button>
					</Card.Description>
				{/if}
			</Card.Header>
			<Card.Content class="my-2 space-y-1 space-x-1">
				<Badge class="bg-(--primary-color) hover:bg-(--primary-color)/90">
					#{CategoryText[article?.category]()}
				</Badge>{#each article?.tags?.slice(0, 3) || [] as tag}
					<Badge variant="secondary">#{tag}</Badge>
				{/each}
			</Card.Content>
		</Card.Root>
	{/each}
</section>

{#if !hideMore}
	<div class="text-right">
		<Button variant="link" class="text-(--primary-color)">
			더 보기
			<ChevronRight class="size-4" />
		</Button>
	</div>
{/if}
