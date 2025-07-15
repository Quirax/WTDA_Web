<script lang="ts">
	import ArticleList from '$stories/components/ArticleList.svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { CirclePlus } from 'lucide-svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { untrack } from 'svelte';
	import { deserialize } from '$app/forms';
	import Pagination from '$lib/components/pagination/pagination.svelte';
	import { profileArticlesPerPage } from '$lib/config';
	import { isDesktop } from '$lib/utils';
	import { goto } from '$app/navigation';
	import { m } from '$lib/messages';

	interface Props extends ReturnType<typeof $props> {
		user: Omit<NonNullable<App.User>, 'status'>;
		key: string;
	}

	const { user, key }: Props = $props();

	// Article List
	let articleListTab = $state<'all' | 'requests'>('all');
	let articleList = $state<App.Articles[] | undefined | null>();
	let articlePage = $state(1);
	let articleTotal = $state(0);

	$effect(() => {
		if (articleListTab) articlePage = 0;
	});

	$effect(() => {
		if (key) articlePage = 0;
	});

	$effect(() => {
		if (user) {
			articleListTab = 'all';
			articleList = [];
			articlePage = 0;
			articleTotal = 0;
		}
	});

	$effect(() => {
		if (articlePage === 0) {
			articlePage = 1;
			return;
		}

		(async () => {
			const formData = new FormData();
			formData.append(
				'tab',
				untrack(() => articleListTab),
			);
			formData.append('page', articlePage.toString());

			// ref: https://svelte.dev/docs/kit/$app-forms#applyAction
			const result = await fetch('?/articles', { method: 'post', body: formData })
				.then((r) => r.text())
				.then((r) => deserialize(r));

			if (result.type === 'success') {
				articleList = result.data?.list as App.Articles[];
				articleTotal = (result.data?.count as number) || 0;
			} else {
				articleList = null;
				articleTotal = 0;
				articlePage = 1;
				console.error(result);
			}
		})();
	});
</script>

<section class="space-y-4">
	<div class="flex justify-between">
		<Tabs.Root bind:value={articleListTab} class="md:w-[400px]">
			<Tabs.List class="[&>*]:text-lg [&>*]:font-bold">
				<Tabs.Trigger value="all">{m['PROFILE.ARTICLES.ALL']()}</Tabs.Trigger>
				<!-- <Tabs.Trigger value="commission_types">{m['ARTICLE_TYPE.COMMISSION']()}</Tabs.Trigger> -->
				<Tabs.Trigger value="requests">{m['ARTICLE_TYPE.REQUEST']()}</Tabs.Trigger>
				<Tabs.Trigger value="portfolio">{m['ARTICLE_TYPE.PORTFOLIO']()}</Tabs.Trigger>
			</Tabs.List>
		</Tabs.Root>

		<DropdownMenu.Root>
			<DropdownMenu.Trigger class="m-0 p-0">
				{#snippet child({ props })}
					<Button {...props} variant="default" class="px-4">
						<CirclePlus />
						{m['PROFILE.ARTICLES.CREATE']()}
					</Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content class="w-56" align="end">
				<DropdownMenu.Group>
					<DropdownMenu.Item onclick={() => goto('/r/create')}>
						{m['ARTICLE_TYPE.REQUEST']()}
					</DropdownMenu.Item>
					<DropdownMenu.Item onclick={() => goto('/pf/create')}>
						{m['ARTICLE_TYPE.PORTFOLIO']()}
					</DropdownMenu.Item>
				</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>

	<ArticleList
		class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
		accentColor={user.profile.accentColor}
		articles={articleList || []} />

	{#if articleTotal > 0}
		<Pagination
			bind:page={articlePage}
			count={articleTotal}
			perPage={profileArticlesPerPage}
			siblingCount={isDesktop() ? 1 : 0} />
	{/if}
</section>
