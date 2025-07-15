<script lang="ts">
	import H2 from '$lib/components/typo/h2.svelte';
	import Header from '$stories/components/Header.svelte';
	import Section from '$stories/components/Section.svelte';
	import * as Form from '$lib/components/ui/form';
	import Input from '$lib/components/ui/input/input.svelte';
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { formSchema, type FormSchema } from '$lib/schema/request';
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
	import { CategoryText, m } from '$lib/messages';
	import Editor from '$lib/components/editor/editor.svelte';
	import * as Carousel from '$lib/components/ui/carousel';
	import * as Card from '$lib/components/ui/card';
	import { AdultContents, ArticleType } from '@app';
	import { userStore } from '$lib/context';
	import Tooltip from '$lib/components/tooltip/Tooltip.svelte';
	import MediaListCarousel from '$stories/components/MediaListCarousel.svelte';

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
		if (thumbnails.length === 0) return;
		if (!thumbnails.includes($formData.thumbnail)) $formData.thumbnail = null;
	});

	const doString = editMode ? m['ARTICLE.EDIT']() : m['ARTICLE.CREATE']();
</script>

<Header title={m['ARTICLE.FORM_TITLE']({ doString, articleType: ArticleType.REQUEST })} />

<Section>
	<H2>{m['ARTICLE.FORM_TITLE']({ doString, articleType: ArticleType.REQUEST })}</H2>
	<form method="POST" use:enhance class="w-full sm:w-2/3">
		<Form.Field {form} name="title" class="mt-4 flex flex-col space-y-1">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>
						<Badge variant="destructive">{m['FORM.REQUIRED']()}</Badge>
						{m['ARTICLE.TITLE']()}
					</Form.Label>
					<Input
						placeholder={m['ARTICLE.TITLE']()}
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
					<Form.Label>
						<Badge variant="destructive">{m['FORM.REQUIRED']()}</Badge>
						{m['ARTICLE.CATEGORY']()}
					</Form.Label>
					<Select.Root type="single" bind:value={$formData.category} name={props.name}>
						<Select.Trigger class="w-[5em]" {...props}>
							{CategoryText[$formData.category]() ||
								m['FORM.SELECT_ITEM']({ item: m['ARTICLE.CATEGORY']() })}
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

		<Form.Field {form} name="budget" class="mt-4 flex flex-col space-y-1">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>
						<Badge variant="destructive">{m['FORM.REQUIRED']()}</Badge>
						{m['REQUEST.BUDGET']()}
					</Form.Label>
					<RadioGroup.Root
						name={props.name}
						value={$formData.budget === null ? 'negotiable' : 'certain-budget'}>
						<div class="flex items-center space-x-2 max-lg:items-center">
							<RadioGroup.Item
								value="certain-budget"
								id="certain-budget"
								onclick={() => ($formData.budget = 0)} />
							<Label for="certain-budget" class="items-center max-lg:flex">
								<div class="flex items-center">
									<Input
										placeholder={m['FORM.CURRENCY']()}
										type="currency"
										{...props}
										bind:value={$formData.budget}
										disabled={$formData.budget === null}
										{...$constraints.budget} />
									<span class="flex-none">&nbsp;{m['POINT']()}</span>
								</div>
							</Label>
						</div>
						<div class="flex items-center space-x-2">
							<RadioGroup.Item
								value="negotiable"
								id="budget-negotiable"
								onclick={() => ($formData.budget = null)} />
							<Label for="budget-negotiable">{m['ARTICLE.NEGOTIABLE']()}</Label>
						</div>
					</RadioGroup.Root>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="deadline" class="mt-4 flex flex-col space-y-1">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>
						<Badge variant="destructive">{m['FORM.REQUIRED']()}</Badge>
						{m['REQUEST.DEADLINE']()}
					</Form.Label>
					<RadioGroup.Root
						name={props.name}
						value={$formData.deadline === null ? 'negotiable' : 'certain-date'}>
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
									$formData.deadline = date;
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
												$formData.deadline === null && 'text-muted-foreground',
											)}
											disabled={$formData.deadline === null}>
											<CalendarIcon />
											{$formData.deadline !== null
												? df.format($formData.deadline)
												: m['FORM.SELECT_ITEM']({ item: m['FORM.DATE']() })}
										</Popover.Trigger>
										<Popover.Content class="w-auto p-0">
											<Calendar
												type="single"
												minValue={today(getLocalTimeZone()).add({ days: 1 })}
												locale="ko-KR"
												bind:value={
													() =>
														$formData.deadline === null
															? undefined
															: fromDate($formData.deadline, getLocalTimeZone()),
													(v) => ($formData.deadline = v?.toDate() ?? null)
												} />
										</Popover.Content>
									</Popover.Root>
								</div>
							</Label>
						</div>
						<div class="flex items-center space-x-2">
							<RadioGroup.Item
								value="negotiable"
								id="deadline-negotiable"
								onclick={() => ($formData.deadline = null)} />
							<Label for="deadline-negotiable">{m['ARTICLE.NEGOTIABLE']()}</Label>
						</div>
					</RadioGroup.Root>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="purpose" class="mt-4 flex flex-col space-y-1">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>
						<Badge variant="destructive">{m['FORM.REQUIRED']()}</Badge>
						{m['REQUEST.PURPOSE_FORM']()}
					</Form.Label>
					<Input
						placeholder={m['REQUEST.PURPOSE_FORM']()}
						{...props}
						bind:value={$formData.purpose}
						{...$constraints.purpose} />
				{/snippet}
			</Form.Control>
			<Form.Description>
				{m['REQUEST.PURPOSE_DESCRIPTION']()}
			</Form.Description>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="isForCommercial" class="mt-1">
			<div class="flex flex-row items-center space-y-0 space-x-3">
				<Form.Control>
					{#snippet children({ props })}
						<Checkbox {...props} bind:checked={$formData.isForCommercial} />
						<div class="space-y-1 leading-none">
							<Form.Label>{m['REQUEST.FOR_COMMERCIAL']()}</Form.Label>
						</div>
						<input name={props.name} value={$formData.isForCommercial} hidden />
					{/snippet}
				</Form.Control>
			</div>
			<Form.Description>
				{m['REQUEST.FOR_COMMERCIAL_DESCRIPTION']()}
				<br />
				<span class="text-destructive font-bold">
					{m['REQUEST.FOR_COMMERCIAL_WARNING']()}
				</span>
			</Form.Description>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="content" class="mt-4 space-y-2">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>{m['ARTICLE.CONTENT']()}</Form.Label>
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
							<MediaListCarousel media={thumbnails.map((v) => ({ src: v, alt: '' }))}>
								{#snippet child(medium)}
									<Card.Root class="size-full">
										<img class="size-full" src={medium.src} alt="" />
										<Checkbox
											class="absolute top-2 right-2 bg-white"
											bind:checked={
												() => $formData.thumbnail === medium.src,
												(v) => ($formData.thumbnail = v ? medium.src : null)
											} />
									</Card.Root>
								{/snippet}
							</MediaListCarousel>
						</div>
					{/if}
				{/snippet}
			</Form.Control>
			<Form.Description>{m['ARTICLE.THUMBNAIL_SELECT_DESCRIPTION']()}</Form.Description>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="tags" class="mt-4 space-y-2">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>{m['ARTICLE.TAG']()}</Form.Label>
					{#each $formData.tags || [] as _, idx (idx)}
						<div class="flex items-center space-x-2">
							<Input placeholder={m['ARTICLE.TAG']()} bind:value={$formData.tags![idx]} />
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
						{m['FORM.ADD_ITEM']({ item: m['ARTICLE.TAG']() })}
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
								<Tooltip text={m['ARTICLE.ADULT_RESTRICTED']()} disabled={isAdult(me)}>
									<Form.Label>
										{m['ARTICLE.ADULT']({ articleType: ArticleType.REQUEST })}
									</Form.Label>
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
								<Tooltip text={m['ARTICLE.GROTESQUE_RESTRICTED']()} disabled={isAdult(me)}>
									<Form.Label>
										{m['ARTICLE.GROTESQUE']({ articleType: ArticleType.REQUEST })}
									</Form.Label>
								</Tooltip>
							</div>
						</div>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="visibleOnlyToCommissioner">
				<div class="flex flex-row items-center space-y-0 space-x-3">
					<Form.Control>
						{#snippet children({ props })}
							<Checkbox {...props} bind:checked={$formData.visibleOnlyToCommissioner} />
							<div class="space-y-1 leading-none">
								<Form.Label>{m['REQUEST.VISIBLE_ONLY_TO_COMMISSIONER']()}</Form.Label>
							</div>
							<input name={props.name} value={$formData.visibleOnlyToCommissioner} hidden />
						{/snippet}
					</Form.Control>
				</div>
				<Form.FieldErrors />
			</Form.Field>
		</div>

		<Form.Button>{doString}</Form.Button>
		<Button variant="secondary" onclick={() => history.back()}>{m['FORM.CANCEL']()}</Button>
	</form>
</Section>
