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
	import Button from '$lib/components/ui/button/button.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import Label from '$lib/components/ui/label/label.svelte';

	interface Props extends ReturnType<typeof $props> {
		data: SuperValidated<Infer<FormSchema>>;
	}

	const { data }: Props = $props();

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

	const title = '의뢰 만들기';
</script>

<Header {title} />

<Section>
	<H2>{title}</H2>
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

		<!-- category -->
		<!-- <Select.Root
											type="single"
											disabled={typeof $profileData.contactAvailable === 'boolean'}>
											<Select.Trigger class="w-[5em]">
												{typeof $profileData.contactAvailable === 'boolean'
													? 23
													: ($profileData.contactAvailable?.to ?? 23)}
											</Select.Trigger>
											<Select.Content>
												{#each Array(24) as _, hour}
													<Select.Item
														value={hour.toString()}
														onclick={() =>
															((
																$profileData.contactAvailable as App.Range<NumberEnumerate<24>>
															).to = hour as NumberEnumerate<24>)}>
														{hour}
													</Select.Item>
												{/each}
											</Select.Content>
										</Select.Root> -->

		<!-- budget -->
		<Form.Field {form} name="budget" class="mt-4 flex flex-col space-y-1">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label><Badge variant="destructive">필수</Badge> 가능한 금액</Form.Label>
					<RadioGroup.Root
						name={props.name}
						value={$formData.budget === null ? 'negotiable' : 'certain-budget'}>
						<div class="flex items-start space-x-2 max-lg:items-center">
							<RadioGroup.Item
								value="certain-budget"
								id="certain-budget"
								onclick={() => ($formData.budget = 0)} />
							<Label for="certain-budget" class="items-center max-lg:flex">
								<div>특정 금액:&nbsp;</div>
								<div class="mt-2 flex items-center">
									<Input
										placeholder="금액"
										{...props}
										value={$formData.budget?.toLocaleString()}
										disabled={$formData.budget === null}
										{...$constraints.budget}
										onkeyup={({ currentTarget: t }) => {
											let budget = parseInt(t.value.replace(/,/g, '') || '0');
											console.log(t.value, t.value.replace(/,/g, ''), budget);
											$formData.budget = budget;
											t.value = budget.toLocaleString();
										}} />
									<span class="flex-none">&nbsp;포인트</span>
								</div>
							</Label>
						</div>
						<div class="flex items-center space-x-2">
							<RadioGroup.Item
								value="negotiable"
								id="budget-negotiable"
								onclick={() => ($formData.budget = null)} />
							<Label for="budget-negotiable">협상 가능</Label>
						</div>
					</RadioGroup.Root>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<!-- deadline -->

		<!-- purpose -->

		<!-- isForCommercial -->

		<!-- content -->
		<!-- <Form.Field form={profileForm} name="introduction">
					<Form.Control>
						{#snippet children({ props })}
							<Editor bind:value={$profileData.introduction} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field> -->

		<!-- tag -->
		<!-- <Form.Field form={profileForm} name="links" class="space-y-2 border p-4">
				<Form.Control>
					{#snippet children({ props })}
						<H3 class="text-xl">링크</H3>
						{#each $profileData.links || [] as _, idx (idx)}
							<div class="flex items-center space-x-2">
								<Input placeholder="표시 명칭" bind:value={$profileData.links![idx].text} />
								<Input placeholder="URL" bind:value={$profileData.links![idx].href} />
								<Button
									variant="outline"
									size="icon"
									onclick={() =>
										($profileData.links = $profileData.links!.filter((_, i) => i !== idx))}
									class="flex-none">
									<X />
								</Button>
							</div>
						{/each}
						<Button
							variant="outline"
							class="w-full"
							onclick={() => {
								if (!$profileData.links) $profileData.links = [];
								$profileData.links = [...$profileData.links, { href: '', text: '' }];
							}}>
							링크 추가
						</Button>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field> -->

		<div class="my-4 border-2">
			<Form.Field {form} name="containsAdultContents" class="p-4">
				<div class="flex flex-row items-center space-y-0 space-x-3">
					<Form.Control>
						{#snippet children({ props })}
							<Checkbox {...props} bind:checked={$formData.containsAdultContents} />
							<div class="space-y-1 leading-none">
								<Form.Label>이 의뢰에는 성인 콘텐츠가 포함되어 있습니다.</Form.Label>
							</div>
							<input name={props.name} value={$formData.containsAdultContents} hidden />
						{/snippet}
					</Form.Control>
				</div>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="visibleOnlyToCommissioner" class="p-4">
				<div class="flex flex-row items-center space-y-0 space-x-3">
					<Form.Control>
						{#snippet children({ props })}
							<Checkbox {...props} bind:checked={$formData.visibleOnlyToCommissioner} />
							<div class="space-y-1 leading-none">
								<Form.Label>커미션주만 이 의뢰를 볼 수 있습니다.</Form.Label>
							</div>
							<input name={props.name} value={$formData.visibleOnlyToCommissioner} hidden />
						{/snippet}
					</Form.Control>
				</div>
				<Form.FieldErrors />
			</Form.Field>
		</div>

		<Form.Button>만들기</Form.Button>
		<Button variant="secondary">취소하기</Button>
	</form>
</Section>
