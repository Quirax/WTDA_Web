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
	import { zod } from 'sveltekit-superforms/adapters';
	import * as Form from '$lib/components/ui/form';
	import { CalendarIcon } from 'lucide-svelte';
	import Calendar from '$lib/components/ui/calendar/calendar.svelte';
	import {
		DateFormatter,
		fromDate,
		getLocalTimeZone,
		today,
		ZonedDateTime,
	} from '@internationalized/date';

	interface Props {
		params: SuperValidated<Infer<FormSchema>>;
	}

	const { params }: Props = $props();

	const df = new DateFormatter('ko-KR', {
		dateStyle: 'long',
	});

	const form = superForm(params, {
		validators: zod(formSchema),
		onResult({ result, cancel }) {
			if ([200, 204, 302].indexOf(result.status || 0) === -1) {
				console.error(result);
				// openErrorAlert = true;
				cancel();
			}
		},
	});
	const { form: formData, constraints, errors } = form;

	const searchRangeText = $derived(
		$formData.search_range.map((v) => SearchRangeText[v]()).join(', '),
	);

	const typeText = $derived($formData.type.map((v) => ArticleTypeText[v]()).join(', '));

	const budgetRangeText = () => {
		const rangeTexts: string[] = Array(0);

		if ($formData.min_budget !== null || $formData.max_budget !== null) rangeTexts.push('설정됨');
		if ($formData.budget_negotiable) rangeTexts.push('협상 가능');

		if (rangeTexts.length === 0) return '';
		else return ` (${rangeTexts.join(', ')})`;
	};

	const flagText = (value: SearchFlag) => SearchFlagText[value]();

	let startDate = $state<ZonedDateTime | undefined>(
		!$formData.date_start ? undefined : fromDate($formData.date_start, getLocalTimeZone()),
	);
	$effect(() => {
		if (startDate) $formData.date_start = startDate.toDate();
		else $formData.date_start = null;
	});

	let endDate = $state<ZonedDateTime | undefined>(
		!$formData.date_end ? undefined : fromDate($formData.date_end, getLocalTimeZone()),
	);
	$effect(() => {
		if (endDate) $formData.date_end = endDate.toDate();
		else $formData.date_end = null;
	});

	const dateRangeText = () => {
		const rangeTexts: string[] = Array(0);

		if (startDate || endDate) rangeTexts.push('설정됨');
		if ($formData.date_negotiable) rangeTexts.push('협상 가능');

		if (rangeTexts.length === 0) return '';
		else return ` (${rangeTexts.join(', ')})`;
	};
</script>

<Header title="'{$formData.query}' 검색결과" />

<!-- ref: https://svelte.dev/docs/kit/link-options#data-sveltekit-preload-data -->
<Section data-sveltekit-preload-data="off">
	<H2>'{$formData.query}' 검색결과</H2>
	<form method="GET" class="my-2 space-y-2 border pt-2 pl-2" action="/search">
		<Form.Field {form} name="query" class="mr-2 flex">
			<Form.Control>
				{#snippet children({ props })}
					<Input
						{...props}
						type="search"
						placeholder="검색하기"
						bind:value={$formData.query}
						{...$constraints.query}
						class="h-xl w-full border-stone-200 bg-stone-50 text-xl text-stone-950" />
					<Button
						type="submit"
						onclick={async (e) => {
							const validated = await form.validateForm();
							if (!validated.valid) {
								e.preventDefault();
								$errors = validated.errors;
							}
						}}>
						검색
					</Button>
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

			<input name="budget_negotiable" value={$formData.budget_negotiable} hidden />
			<input name="min_budget" value={$formData.min_budget} hidden />
			<input name="max_budget" value={$formData.max_budget} hidden />
			<Popover.Root>
				<Popover.Trigger
					class={cn(
						buttonVariants({
							variant: 'outline',
							class: 'mb-2 w-[16em] justify-start text-left font-normal',
						}),
						$formData.min_budget === null &&
							$formData.max_budget === null &&
							!$formData.budget_negotiable &&
							'text-muted-foreground',
						(($errors.min_budget?.length || 0) > 0 || ($errors.max_budget?.length || 0) > 0) &&
							'border-destructive bg-destructive/10 border-2',
					)}>
					{`금액 범위${budgetRangeText()}`}
				</Popover.Trigger>
				<Popover.Content class="flex w-auto flex-col space-y-2 p-2">
					<Form.Field {form} name="min_budget">
						<Form.Control>
							{#snippet children({ props })}
								<div class="flex items-center">
									<span class="flex-none">최소:&nbsp;</span>
									<Input
										{...props}
										placeholder="금액"
										type="currency"
										nullable
										bind:value={$formData.min_budget}
										{...$constraints.min_budget} />
									<span class="flex-none">&nbsp;포인트</span>
								</div>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					<Form.Field {form} name="max_budget">
						<Form.Control>
							{#snippet children({ props })}
								<div class="flex items-center">
									<span class="flex-none">최대:&nbsp;</span>
									<Input
										{...props}
										placeholder="금액"
										type="currency"
										nullable
										bind:value={$formData.max_budget}
										{...$constraints.max_budget} />
									<span class="flex-none">&nbsp;포인트</span>
								</div>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					<Form.Field {form} name="budget_negotiable" class="flex flex-row space-x-2">
						<Form.Control>
							{#snippet children({ props })}
								<Checkbox {...props} bind:checked={$formData.budget_negotiable} />
								<div class="leading-none">
									<Form.Label>협상 가능한 경우를 포함함</Form.Label>
								</div>
							{/snippet}
						</Form.Control>
					</Form.Field>
				</Popover.Content>
			</Popover.Root>

			<input name="date_negotiable" value={$formData.date_negotiable} hidden />
			<input name="date_start" value={$formData.date_start} hidden />
			<input name="date_end" value={$formData.date_end} hidden />
			<Popover.Root>
				<Popover.Trigger
					class={cn(
						buttonVariants({
							variant: 'outline',
							class: 'mb-2 w-[16em] justify-start text-left font-normal',
						}),
						!startDate && !endDate && !$formData.date_negotiable && 'text-muted-foreground',
						(($errors.date_start?.length || 0) > 0 || ($errors.date_end?.length || 0) > 0) &&
							'border-destructive bg-destructive/10 border-2',
					)}>
					{`일정 범위${dateRangeText()}`}
				</Popover.Trigger>
				<Popover.Content class="flex w-auto flex-col space-y-2 p-2">
					<Form.Field {form} name="date_start">
						<Form.Control>
							{#snippet children({ props })}
								<div class="flex items-center">
									<Popover.Root>
										<Popover.Trigger
											class={cn(
												buttonVariants({
													variant: 'outline',
													class: 'w-[13em] justify-start text-left font-normal',
												}),
												!$formData.date_start && 'text-muted-foreground',
											)}>
											<CalendarIcon />
											{$formData.date_start ? df.format($formData.date_start) : '날짜 선택'}
										</Popover.Trigger>
										<Popover.Content class="w-auto p-0">
											<Calendar type="single" locale="ko-KR" bind:value={startDate} />
										</Popover.Content>
									</Popover.Root>
									<span class="flex-none">&nbsp;부터</span>
								</div>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					<Form.Field {form} name="date_end">
						<Form.Control>
							{#snippet children({ props })}
								<div class="flex items-center">
									<Popover.Root>
										<Popover.Trigger
											class={cn(
												buttonVariants({
													variant: 'outline',
													class: 'w-[13em] justify-start text-left font-normal',
												}),
												!$formData.date_end && 'text-muted-foreground',
											)}>
											<CalendarIcon />
											{$formData.date_end ? df.format($formData.date_end) : '날짜 선택'}
										</Popover.Trigger>
										<Popover.Content class="w-auto p-0">
											<Calendar type="single" locale="ko-KR" bind:value={endDate} />
										</Popover.Content>
									</Popover.Root>
									<span class="flex-none">&nbsp;까지</span>
								</div>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					<Form.Field {form} name="date_negotiable" class="flex flex-row space-x-2">
						<Form.Control>
							{#snippet children({ props })}
								<Checkbox {...props} bind:checked={$formData.date_negotiable} />
								<div class="leading-none">
									<Form.Label>협상 가능한 경우를 포함함</Form.Label>
								</div>
							{/snippet}
						</Form.Control>
					</Form.Field>
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
