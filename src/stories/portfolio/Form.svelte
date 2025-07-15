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
	import { cn, isAdult, uploadImage } from '$lib/utils';
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
	import CalendarWithSelects from '$lib/components/calendar/CalendarWithSelects.svelte';
	import Dropzone from 'svelte-file-dropzone';
	import { imageFormat } from '$lib/config';
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

	$effect(() => {
		if (!$formData.thumbnail) return;
		if (!$formData.media.includes($formData.thumbnail)) $formData.thumbnail = null;
	});

	const doString = editMode ? m['ARTICLE.EDIT']() : m['ARTICLE.CREATE']();

	const onDropMedia = async ({ detail }: any) => {
		const { acceptedFiles } = detail;

		let imageFile = acceptedFiles[0];

		if (!imageFile) return;

		try {
			const path = await uploadImage(imageFile);

			$formData.media = [...$formData.media, path];
		} catch (err) {
			console.error(err);
		}
	};
</script>

<Header title={m['ARTICLE.FORM_TITLE']({ doString, articleType: ArticleType.PORTFOLIO })} />

<Section>
	<H2>{m['ARTICLE.FORM_TITLE']({ doString, articleType: ArticleType.PORTFOLIO })}</H2>
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

		<Form.Field {form} name="publishDate" class="mt-4 flex flex-col space-y-1">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>
						<Badge variant="destructive">{m['FORM.REQUIRED']()}</Badge>
						{m['PORTFOLIO.PUBLISH_DATE']()}
					</Form.Label>
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
												: m['FORM.SELECT_ITEM']({ item: m['FORM.DATE']() })}
										</Popover.Trigger>
										<Popover.Content class="w-auto p-0">
											<CalendarWithSelects
												type="single"
												maxValue={today(getLocalTimeZone())}
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
							<Label for="publishDate-unknown">{m['PORTFOLIO.PUBLISH_DATE_UNKNOWN']()}</Label>
						</div>
					</RadioGroup.Root>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="media" class="mt-4 space-y-2">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>{m['ARTICLE.ATTACHING_MEDIA']()}</Form.Label>

					{#if $formData.media.length > 0}
						<div class="flex w-full justify-center">
							<MediaListCarousel media={$formData.media.map((v) => ({ src: v, alt: '' }))}>
								{#snippet child(medium)}
									<Card.Root class="size-full">
										<img class="size-full" src={medium.src} alt="" />
										<Checkbox
											class="absolute top-2 left-6 bg-white"
											bind:checked={
												() => $formData.thumbnail === medium.src,
												(v) => ($formData.thumbnail = v ? medium.src : null)
											} />
										<X
											class="bg-destructive text-destructive-foreground absolute top-2 right-2 size-5"
											onclick={() => {
												$formData.media = $formData.media.filter((v) => v !== medium.src);
											}} />
									</Card.Root>
								{/snippet}
							</MediaListCarousel>
						</div>
					{/if}

					<Dropzone
						accept={imageFormat}
						on:drop={onDropMedia}
						multiple={false}
						class="dropzone size-full justify-center">
						<p>{m['ARTICLE.ATTACHING_MEDIA_DROPZONE']()}</p>
					</Dropzone>
				{/snippet}
			</Form.Control>
			<Form.Description>{m['ARTICLE.ATTACHING_MEDIA_DESCRIPTION']()}</Form.Description>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="content" class="mt-4 space-y-2">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>{m['ARTICLE.CONTENT']()}</Form.Label>
					<Editor bind:value={$formData.content} />
				{/snippet}
			</Form.Control>
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
										{m['ARTICLE.ADULT']({ articleType: ArticleType.PORTFOLIO })}
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
										{m['ARTICLE.GROTESQUE']({ articleType: ArticleType.PORTFOLIO })}
									</Form.Label>
								</Tooltip>
							</div>
						</div>
					{/snippet}
				</Form.Control>
			</Form.Field>
		</div>

		<Form.Button>{doString}</Form.Button>
		<Button variant="secondary" onclick={() => history.back()}>{m['FORM.CANCEL']()}</Button>
	</form>
</Section>
