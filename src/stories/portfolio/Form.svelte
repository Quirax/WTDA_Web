<script lang="ts">
	import H2 from '$lib/components/typo/h2.svelte';
	import Header from '$stories/components/Header.svelte';
	import Section from '$stories/components/Section.svelte';
	import * as Form from '$lib/components/ui/form';
	import Input from '$lib/components/ui/input/input.svelte';
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { formSchema, type FormSchema } from '$lib/schema/portfolio';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import * as Popover from '$lib/components/ui/popover';
	import Label from '$lib/components/ui/label/label.svelte';
	import { cn, isAdult } from '$lib/utils';
	import { CalendarIcon, X } from 'lucide-svelte';
	import { DateFormatter, fromDate, getLocalTimeZone, today } from '@internationalized/date';
	import Calendar from '$lib/components/ui/calendar/calendar.svelte';
	import * as Select from '$lib/components/ui/select/index.js';
	import { CategoryText } from '$lib/messages';
	import Editor from '$lib/components/editor/editor.svelte';
	import * as Carousel from '$lib/components/ui/carousel';
	import * as Card from '$lib/components/ui/card';
	import { AdultContents } from '@app';
	import { userStore } from '$lib/context';
	import Tooltip from '$lib/components/tooltip/Tooltip.svelte';
	import CalendarWithSelects from '$lib/components/calendar/CalendarWithSelects.svelte';

	const df = new DateFormatter('ko-KR', {
		dateStyle: 'long',
	});

	interface Props extends ReturnType<typeof $props> {
		data: SuperValidated<Infer<FormSchema>>;
		editMode?: boolean;
	}

	let me = $state<App.User>(null);
	userStore.subscribe((v) => (me = v));

	const { data, editMode = false }: Props = $props();

	const form = superForm(data, {
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
	const { form: formData, enhance, constraints } = form;

	let thumbnails = $state<Array<string>>([]);

	$effect(() => {
		if (!$formData.thumbnail) return;
		if (!thumbnails.includes($formData.thumbnail)) $formData.thumbnail = null;
	});

	const doString = editMode ? '수정하기' : '만들기';
</script>

<Header title="포트폴리오 {doString}" />

<Section>
	<H2>포트폴리오 {doString}</H2>
	<form method="POST" use:enhance class="w-full sm:w-2/3">
		<Form.Field {form} name="title" class="mt-4 flex flex-col space-y-1">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label><Badge variant="destructive">필수</Badge> 제목</Form.Label>
					<Input
						placeholder="제목"
						{...props}
						bind:value={$formData.title}
						{...$constraints.title} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="category" class="mt-4 flex flex-col space-y-1">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label><Badge variant="destructive">필수</Badge> 카테고리</Form.Label>
					<Select.Root type="single" bind:value={$formData.category} name={props.name}>
						<Select.Trigger class="w-[5em]" {...props}>
							{CategoryText[$formData.category]() || '카테고리 선택'}
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
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="publishDate" class="mt-4 flex flex-col space-y-1">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label><Badge variant="destructive">필수</Badge> 작업 및 게시 일자</Form.Label>
					<RadioGroup.Root
						name={props.name}
						value={$formData.publishDate === null ? 'unknown' : 'certain-date'}>
						<div class="flex items-center space-x-2 max-lg:items-center">
							<RadioGroup.Item
								value="certain-date"
								id="certain-date"
								onclick={() => {
									const date = new Date();
									date.setDate(date.getDate() + 1);
									date.setUTCHours(0);
									date.setUTCMinutes(0);
									date.setUTCSeconds(0);
									date.setUTCMilliseconds(0);
									$formData.publishDate = date;
								}} />
							<Label for="certain-date" class="items-center max-lg:flex">
								<div class="flex items-center">
									<Popover.Root>
										<Popover.Trigger
											class={cn(
												buttonVariants({
													variant: 'outline',
													class: 'w-[280px] justify-start text-left font-normal',
												}),
												$formData.publishDate === null && 'text-muted-foreground',
											)}
											disabled={$formData.publishDate === null}>
											<CalendarIcon />
											{$formData.publishDate !== null
												? df.format($formData.publishDate)
												: '날짜 선택'}
										</Popover.Trigger>
										<Popover.Content class="w-auto p-0">
											<CalendarWithSelects
												type="single"
												maxValue={today(getLocalTimeZone()).add({ days: 1 })}
												locale="ko-KR"
												bind:value={
													() =>
														$formData.publishDate === null
															? undefined
															: fromDate($formData.publishDate, getLocalTimeZone()),
													(v) => ($formData.publishDate = v?.toDate() ?? null)
												} />
										</Popover.Content>
									</Popover.Root>
								</div>
							</Label>
						</div>
						<div class="flex items-center space-x-2">
							<RadioGroup.Item
								value="unknown"
								id="publishDate-unknown"
								onclick={() => ($formData.publishDate = null)} />
							<Label for="publishDate-unknown">미상</Label>
						</div>
					</RadioGroup.Root>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="content" class="mt-4 space-y-2">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>세부적인 설명</Form.Label>
					<Editor
						bind:value={$formData.content}
						onchange={(_, delta) =>
							(thumbnails = delta.ops
								.map((v) => v.insert)
								.reduce((acc, cur) => {
									if (typeof cur === 'object' && typeof cur.image === 'string') {
										return [...acc, cur.image];
									} else return acc;
								}, new Array<string>()))} />

					{#if thumbnails.length > 0}
						<div class="flex w-full justify-center">
							<Carousel.Root class="align-center" opts={{ loop: true, align: 'start' }}>
								<Carousel.Content class="w-44 md:w-88 lg:w-132 xl:w-176 2xl:w-220">
									{#each thumbnails as thumbnail}
										<Carousel.Item
											class="relative aspect-square h-40 md:basis-1/2 lg:basis-1/3 xl:basis-1/4 2xl:basis-1/5">
											<div class="size-full p-1">
												<Card.Root class="size-full">
													<img class="size-full" src={thumbnail} alt="" />
													<Checkbox
														class="absolute top-2 right-2 bg-white"
														bind:checked={
															() => $formData.thumbnail === thumbnail,
															(v) => ($formData.thumbnail = v ? thumbnail : null)
														} />
												</Card.Root>
											</div>
										</Carousel.Item>
									{/each}
								</Carousel.Content>
								<Carousel.Previous />
								<Carousel.Next />
							</Carousel.Root>
						</div>
					{/if}
				{/snippet}
			</Form.Control>
			<Form.Description>이미지 목록에서 체크 표시된 이미지가 썸네일로 사용됩니다.</Form.Description>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="tags" class="mt-4 space-y-2">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>태그</Form.Label>
					{#each $formData.tags || [] as _, idx (idx)}
						<div class="flex items-center space-x-2">
							<Input placeholder="태그" bind:value={$formData.tags![idx]} />
							<Button
								variant="outline"
								size="icon"
								onclick={() => ($formData.tags = $formData.tags!.filter((_, i) => i !== idx))}
								class="flex-none">
								<X />
							</Button>
						</div>
					{/each}
					<Button
						variant="outline"
						class="w-full"
						onclick={() => {
							if (!$formData.tags) $formData.tags = [];
							$formData.tags = [...$formData.tags, ''];
						}}>
						태그 추가
					</Button>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<div class="my-4 space-y-4 border-2 p-4">
			<Form.Field {form} name="containsAdultContents" class="space-y-4">
				<Form.Control>
					{#snippet children({ props })}
						<input name={props.name} value={$formData.containsAdultContents} hidden />
						<div class="flex flex-row items-center space-y-0 space-x-3">
							<Checkbox
								{...props}
								disabled={!isAdult(me)}
								bind:checked={
									() => $formData.containsAdultContents !== AdultContents.NORMAL,
									(v) =>
										($formData.containsAdultContents = v
											? AdultContents.ADULT_RESTRICTED
											: AdultContents.NORMAL)
								} />
							<div class="space-y-1 leading-none">
								<Tooltip
									text="관계 법령에 따라 본인인증이 되지 않거나 미성년자인 경우 성인 콘텐츠를 작성할 수 없습니다."
									disabled={isAdult(me)}>
									<Form.Label>이 의뢰에는 성인 콘텐츠가 포함되어 있습니다.</Form.Label>
								</Tooltip>
							</div>
						</div>
						<div class="ml-8 flex flex-row items-center space-y-0 space-x-3">
							<Checkbox
								{...props}
								disabled={!isAdult(me) || $formData.containsAdultContents === AdultContents.NORMAL}
								bind:checked={
									() => $formData.containsAdultContents === AdultContents.GROTESQUE_RESTRICTED,
									(v) =>
										($formData.containsAdultContents = v
											? AdultContents.GROTESQUE_RESTRICTED
											: AdultContents.ADULT_RESTRICTED)
								} />
							<div class="space-y-1 leading-none">
								<Tooltip
									text="관계 법령에 따라 본인인증이 되지 않거나 미성년자인 경우 잔인한 콘텐츠를 작성할 수 없습니다."
									disabled={isAdult(me)}>
									<Form.Label>이 의뢰에는 유혈 등 잔인한 콘텐츠가 포함되어 있습니다.</Form.Label>
								</Tooltip>
							</div>
						</div>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
		</div>

		<Form.Button>{doString}</Form.Button>
		<Button variant="secondary" onclick={() => history.back()}>취소하기</Button>
	</form>
</Section>
