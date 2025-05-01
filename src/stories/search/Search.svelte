<script lang="ts">
	import H2 from '$lib/components/typo/h2.svelte';
	import Header from '$stories/components/Header.svelte';
	import Section from '$stories/components/Section.svelte';
	import * as Select from '$lib/components/ui/select/index.js';
	import { ArticleTypeText, CategoryText, SearchFlagText, SearchRangeText } from '$lib/messages';
	import * as Popover from '$lib/components/ui/popover';
	import { cn, isDesktop } from '$lib/utils';
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
	import RangeCalendar from '$lib/components/ui/range-calendar/range-calendar.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import ArticleList from '$stories/components/ArticleList.svelte';
	import { ArticleCategory, UserStatus, type SearchFlag } from '@app';
	import DocsImage from '$stories/assets/docs.png';
	import ProfileImage from '$stories/assets/profile_example.png';
	import Pagination from '$lib/components/pagination/pagination.svelte';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { formSchema, type FormSchema } from '$lib/schema/search';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import * as Form from '$lib/components/ui/form';

	interface Props {
		query: string | undefined;
		params: SuperValidated<Infer<FormSchema>>;
	}

	const { query, params }: Props = $props();

	const form = superForm(params, {
		validators: zodClient(formSchema),
		dataType: 'json',
		onResult({ result, cancel }) {
			if ([200, 204, 302].indexOf(result.status || 0) === -1) {
				console.error(result);
				// openErrorAlert = true;
				cancel();
			}
		},
	});
	const { form: formData, constraints } = form;

	const searchRangeText = $derived(
		$formData.search_range.map((v) => SearchRangeText[v]()).join(', '),
	);

	const typeText = $derived($formData.type.map((v) => ArticleTypeText[v]()).join(', '));

	const flagText = (value: SearchFlag) => SearchFlagText[value]();
</script>

<Header title="'{query}' 검색결과" />

<Section>
	<H2>'{query}' 검색결과</H2>
	<form method="GET" class="my-2 space-y-2 border pt-2 pl-2" action="/search">
		<Form.Field {form} name="query" class="flex">
			<Form.Control>
				{#snippet children({ props })}
					<Input
						{...props}
						type="search"
						placeholder="검색하기"
						bind:value={$formData.query}
						{...$constraints.query}
						class="h-xl w-full border-stone-200 bg-stone-50 text-xl text-stone-950" />
					<Button type="submit">검색</Button>
				{/snippet}
			</Form.Control>
		</Form.Field>
		<div class="flex flex-wrap space-x-2">
			<Form.Field {form} name="search_range">
				<Form.Control>
					{#snippet children({ props })}
						<Select.Root type="multiple" {...props} bind:value={$formData.search_range}>
							<Select.Trigger class="w-[16em]">
								{'검색 범위' + (searchRangeText ? ': ' + searchRangeText : '')}
							</Select.Trigger>
							<Select.Content>
								{#each Object.entries(SearchRangeText) as [k, v]}
									<Select.Item value={k}>
										{v()}
									</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					{/snippet}
				</Form.Control>
			</Form.Field>

			<Form.Field {form} name="type">
				<Form.Control>
					{#snippet children({ props })}
						<Select.Root type="multiple" {...props} bind:value={$formData.type}>
							<Select.Trigger class="w-[12em]">
								{'타입' + (typeText ? ': ' + typeText : '')}
							</Select.Trigger>
							<Select.Content>
								{#each Object.entries(ArticleTypeText) as [k, v]}
									<Select.Item value={k}>
										{v()}
									</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					{/snippet}
				</Form.Control>
			</Form.Field>

			<Form.Field {form} name="category">
				<Form.Control>
					{#snippet children({ props })}
						<Select.Root type="multiple" {...props} bind:value={$formData.category}>
							<Select.Trigger class="w-[10em]">
								{'카테고리 (' + $formData.category.length + '개)'}
							</Select.Trigger>
							<Select.Content>
								{#each Object.entries(CategoryText) as [k, v]}
									<Select.Item value={k}>
										{v()}
									</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					{/snippet}
				</Form.Control>
			</Form.Field>

			<Popover.Root>
				<Popover.Trigger
					class={cn(
						buttonVariants({
							variant: 'outline',
							class: 'mb-2 w-[10em] justify-start text-left font-normal',
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
						<Checkbox id="budget-negotiable" />
						<!-- bind:checked -->
						<div class="leading-none">
							<label for="budget-negotiable">협상 가능한 경우를 포함함</label>
						</div>
					</div>
				</Popover.Content>
			</Popover.Root>

			<Popover.Root>
				<Popover.Trigger
					class={cn(
						buttonVariants({
							variant: 'outline',
							class: 'mb-2 w-[10em] justify-start text-left font-normal',
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

			<Form.Field {form} name="commercial_use">
				<Form.Control>
					{#snippet children({ props })}
						<Select.Root type="single" {...props} bind:value={$formData.commercial_use}>
							<Select.Trigger class="w-[11em]">
								{'상업적 목적: ' + flagText($formData.commercial_use)}
							</Select.Trigger>
							<Select.Content>
								{#each Object.entries(SearchFlagText) as [k, v]}
									<Select.Item value={k}>
										{v()}
									</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					{/snippet}
				</Form.Control>
			</Form.Field>

			<Form.Field {form} name="adult_contents">
				<Form.Control>
					{#snippet children({ props })}
						<Select.Root type="single" {...props} bind:value={$formData.adult_contents}>
							<Select.Trigger class="w-[11em]">
								{'성인 콘텐츠: ' + flagText($formData.adult_contents)}
							</Select.Trigger>
							<Select.Content>
								{#each Object.entries(SearchFlagText) as [k, v]}
									<Select.Item value={k}>
										{v()}
									</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					{/snippet}
				</Form.Control>
			</Form.Field>
		</div>
	</form>
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
