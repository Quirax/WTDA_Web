<svelte:options runes />

<script lang="ts">
	import H2 from '$lib/components/typo/h2.svelte';
	import { passwordSchema, type PasswordSchema } from '$lib/schema/login';
	import Section from '$stories/components/Section.svelte';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import * as Form from '$lib/components/ui/form';
	import Input from '$lib/components/ui/input/input.svelte';
	import P from '$lib/components/typo/p.svelte';
	import { layoutStore } from '$lib/context';
	import { goto } from '$app/navigation';

	interface Props {
		data: SuperValidated<Infer<PasswordSchema>>;
	}

	const { data }: Props = $props();

	$effect.pre(() => {
		layoutStore.update((value) => {
			const newValue = { ...value };

			newValue.title = '비밀번호 재설정';
			newValue.showSearchPanel = false;
			newValue.showUserPanel = false;

			return newValue;
		});
	});

	let disableButton = $state(false);

	const form = superForm(data, {
		validators: zodClient(passwordSchema),
		onSubmit() {
			disableButton = true;
		},
		onResult({ result, cancel }) {
			layoutStore.update((value) => {
				const newValue = { ...value };

				if ([200, 204, 302].indexOf(result.status || 0) === -1) {
					newValue.alert = {
						title: '비밀번호 재설정 도중 오류가 발생했습니다.',
						description: '고객센터에 문의해주시기 바랍니다.',
					};
					disableButton = false;
					cancel();
				} else {
					newValue.alert = {
						title: '비밀번호가 재설정되었습니다.',
						description: '변경된 비밀번호로 다시 로그인하시기 바랍니다.',
						onAction: () => {
							goto('/login');
						},
					};
				}

				newValue.openAlert = true;

				return newValue;
			});
		},
	});
	const { form: formData, enhance, constraints } = form;
</script>

<Section>
	<H2>비밀번호 재설정</H2>
	<P>새로운 비밀번호를 입력하십시오</P>
	<form method="POST" use:enhance class="w-2/3" action="?">
		<Form.Field {form} name="password" class="flex flex-col my-4 space-y-1">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>새 비밀번호</Form.Label>
					<Input
						{...props}
						type="password"
						bind:value={$formData.password}
						{...$constraints.password} />
				{/snippet}
			</Form.Control>
			<Form.Description>최소 8자 이상</Form.Description>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Field {form} name="passwordConfirm" class="flex flex-col mb-4 space-y-1">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>비밀번호 확인</Form.Label>
					<Input
						{...props}
						type="password"
						bind:value={$formData.passwordConfirm}
						{...$constraints.passwordConfirm} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Button disabled={disableButton}>비밀번호 재설정</Form.Button>
	</form>
</Section>
