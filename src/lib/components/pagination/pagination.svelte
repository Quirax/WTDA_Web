<script lang="ts">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	// import { MediaQuery } from 'svelte/reactivity';
	import * as Pagination from '$lib/components/ui/pagination/index.js';

	// const isDesktop = new MediaQuery('(min-width: 768px)');

	interface Props extends ReturnType<typeof $props> {
		count: number;
		perPage: number;
		siblingCount: number;
		page: number;
	}

	let { count, perPage, siblingCount, page = $bindable(1) }: Props = $props();

	// const count = 20;

	// const perPage = $derived(isDesktop.current ? 3 : 8);
	// const siblingCount = $derived(isDesktop.current ? 1 : 0);
</script>

<Pagination.Root {count} {perPage} {siblingCount} bind:page>
	{#snippet children({ pages, currentPage })}
		<Pagination.Content>
			<Pagination.Item>
				<Pagination.PrevButton>
					<ChevronLeft class="size-4" />
					<span class="hidden sm:block">이전</span>
				</Pagination.PrevButton>
			</Pagination.Item>
			{#each pages as page (page.key)}
				{#if page.type === 'ellipsis'}
					<Pagination.Item>
						<Pagination.Ellipsis />
					</Pagination.Item>
				{:else}
					<Pagination.Item>
						<Pagination.Link {page} isActive={currentPage === page.value}>
							{page.value}
						</Pagination.Link>
					</Pagination.Item>
				{/if}
			{/each}
			<Pagination.Item>
				<Pagination.NextButton>
					<span class="hidden sm:block">다음</span>
					<ChevronRight class="size-4" />
				</Pagination.NextButton>
			</Pagination.Item>
		</Pagination.Content>
	{/snippet}
</Pagination.Root>
