<script lang="ts">
	import H2 from '$lib/components/typo/h2.svelte';
	import Header from '$stories/components/Header.svelte';
	import Section from '$stories/components/Section.svelte';
	import * as Select from '$lib/components/ui/select/index.js';
	import { ArticleTypeText, CategoryText } from '$lib/messages';
	import * as Popover from '$lib/components/ui/popover';
	import { cn, isDesktop } from '$lib/utils';
	import { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
	import RangeCalendar from '$lib/components/ui/range-calendar/range-calendar.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import ArticleList from '$stories/components/ArticleList.svelte';
	import { ArticleCategory, UserStatus } from '@app';
	import DocsImage from '$stories/assets/docs.png';
	import ProfileImage from '$stories/assets/profile_example.png';
	import Pagination from '$lib/components/pagination/pagination.svelte';

	interface Props {
		query: string | undefined;
	}

	const { query }: Props = $props();
</script>

<Header title="'{query}' 검색결과" />

<Section>
	<H2>'{query}' 검색결과</H2>
	<nav class="my-2 flex flex-wrap space-y-2 space-x-2 border pt-2 pl-2">
		<Select.Root type="multiple" name="search_range">
			<!-- bind:value -->
			<Select.Trigger class="w-[10em]">
				{'검색 범위'}<!-- ArticleTypeText[$formData.type]() -->
			</Select.Trigger>
			<Select.Content>
				<Select.Item value={'title'}>제목</Select.Item>
				<Select.Item value={'content'}>내용</Select.Item>
				<Select.Item value={'tag'}>태그</Select.Item>
			</Select.Content>
		</Select.Root>

		<Select.Root type="single" name="type">
			<!-- bind:value -->
			<Select.Trigger class="w-[10em]">
				{'타입'}<!-- ArticleTypeText[$formData.type]() -->
			</Select.Trigger>
			<Select.Content>
				<Select.Item value={''}>모두</Select.Item>
				{#each Object.entries(ArticleTypeText) as [k, v]}
					<Select.Item value={k}>
						{v()}
					</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>

		<Select.Root type="single" name="category">
			<!-- bind:value -->
			<Select.Trigger class="w-[10em]">
				{'카테고리'}<!-- CategoryText[$formData.category]() -->
			</Select.Trigger>
			<Select.Content>
				<Select.Item value={''}>모두</Select.Item>
				{#each Object.entries(CategoryText) as [k, v]}
					<Select.Item value={k}>
						{v()}
					</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>

		<Popover.Root>
			<Popover.Trigger
				class={cn(
					buttonVariants({
						variant: 'outline',
						class: 'w-[10em] justify-start text-left font-normal',
					}),
					'text-muted-foreground',
				)}>
				<!-- !value -> muted -->
				금액 범위
			</Popover.Trigger>
			<Popover.Content class="flex w-auto flex-col space-y-2 p-2">
				<div class="flex items-center">
					<span class="flex-none">최소:&nbsp;</span>
					<Input placeholder="금액" type="currency" />
					<!-- bind:value disabled -->
					<span class="flex-none">&nbsp;포인트</span>
				</div>
				<div class="flex items-center">
					<span class="flex-none">최대:&nbsp;</span>
					<Input placeholder="금액" type="currency" />
					<!-- bind:value disabled -->
					<span class="flex-none">&nbsp;포인트</span>
				</div>
				<div class="flex flex-row space-x-2">
					<Checkbox id="date-negotiable" />
					<!-- bind:checked -->
					<div class="leading-none">
						<label for="date-negotiable">협상 가능한 경우를 포함함</label>
					</div>
				</div>
			</Popover.Content>
		</Popover.Root>

		<Popover.Root>
			<Popover.Trigger
				class={cn(
					buttonVariants({
						variant: 'outline',
						class: 'w-[10em] justify-start text-left font-normal',
					}),
					'text-muted-foreground',
				)}>
				<!-- !value -> muted -->
				일정 범위
				<!-- {#if value && value.start}
        {#if value.end}
          {df.format(value.start.toDate(getLocalTimeZone()))} - {df.format(
            value.end.toDate(getLocalTimeZone())
          )}
        {:else}
          {df.format(value.start.toDate(getLocalTimeZone()))}
        {/if}
      {:else if startValue}
        {df.format(startValue.toDate(getLocalTimeZone()))}
      {:else}
        Pick a date
      {/if} -->
				<!-- df.format(value.toDate(getLocalTimeZone())) -->
			</Popover.Trigger>
			<Popover.Content class="flex w-auto flex-col space-y-2 p-2">
				<div class="border">
					<RangeCalendar numberOfMonths={2} locale="ko-KR" />
					<!-- bind:value onStartValueChange -->
				</div>
				<div class="flex flex-row space-x-2">
					<Checkbox id="date-negotiable" />
					<!-- bind:checked -->
					<div class="leading-none">
						<label for="date-negotiable">협상 가능한 경우를 포함함</label>
					</div>
				</div>
			</Popover.Content>
		</Popover.Root>

		<Select.Root type="single" name="commercial_use">
			<!-- bind:value -->
			<Select.Trigger class="w-[10em]">
				{'상업적 목적'}<!-- ArticleTypeText[$formData.type]() -->
			</Select.Trigger>
			<Select.Content>
				<Select.Item value={'all'}>모두</Select.Item>
				<Select.Item value={'excluded'}>제외</Select.Item>
				<Select.Item value={'required'}>필수</Select.Item>
			</Select.Content>
		</Select.Root>

		<Select.Root type="single" name="adult_contents">
			<!-- bind:value -->
			<Select.Trigger class="w-[10em]">
				{'성인 콘텐츠'}<!-- ArticleTypeText[$formData.type]() -->
			</Select.Trigger>
			<Select.Content>
				<Select.Item value={'all'}>모두</Select.Item>
				<Select.Item value={'excluded'}>제외</Select.Item>
				<Select.Item value={'required'}>필수</Select.Item>
			</Select.Content>
		</Select.Root>
	</nav>
	<section>
		<ArticleList
			id="contents-list"
			class="my-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
			articles={Array(10)
				.fill(undefined)
				.map((_, i) => ({
					id: 'asdf',
					thumbnail: DocsImage,
					title: `커미션 ${i + 1}`,
					author: {
						id: 'quiraxical',
						username: 'Quirax Lee',
						profileImage: ProfileImage,
						email: '',
						status: UserStatus.REQUIRED_EMAIL_CONFIRM,
						preferences: {},
						profile: {},
					},
					category: ArticleCategory.DRAWING,
					tags: ['이런 태그', '저런 태그', '요런 태그', '이건 잘림'],
				}))}
			hideMore />
		<Pagination page={1} count={100} perPage={10} siblingCount={isDesktop() ? 1 : 0} />
		<!-- bind:page -->
	</section>
</Section>
