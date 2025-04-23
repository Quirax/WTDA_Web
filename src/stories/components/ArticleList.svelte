<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Avatar from './Avatar.svelte';

	interface Props extends ReturnType<typeof $props> {
		articles: App.Articles[];
		hideAuthor?: boolean;
		accentColor?: string;
	}

	const { articles, hideAuthor = false, style, accentColor, ...restProps }: Props = $props();
</script>

<section style="--primary-color: {accentColor || 'hsl(var(--primary));'} {style}" {...restProps}>
	{#each articles as article}
		<Card.Root>
			<img src={article?.thumbnail} alt={article?.title} class="aspect-video w-full object-cover" />
			<Card.Header>
				<Card.Title>{article?.title}</Card.Title>
				{#if !hideAuthor}
					<Card.Description class="text-right">
						by
						<Avatar class="inline-block h-6 w-6 align-middle" user={article?.author} />
						{article?.author.username}
					</Card.Description>
				{/if}
			</Card.Header>
			<Card.Content>
				<Badge class="m-1 bg-(--primary-color) hover:bg-(--primary-color)/90">
					#{article?.category}
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
