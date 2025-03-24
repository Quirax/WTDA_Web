<svelte:options runes />

<script lang="ts">
	import H2 from '$lib/components/typo/h2.svelte';
	import { passwordSchema, type PasswordSchema } from '$lib/schema/login';
	import Section from '$stories/components/Section.svelte';
	import Layout, { type Alert } from '$stories/Layout.svelte';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import * as Form from '$lib/components/ui/form';
	import Input from '$lib/components/ui/input/input.svelte';
	import P from '$lib/components/typo/p.svelte';

	interface Props {
		data: SuperValidated<Infer<PasswordSchema>>;
	}

	const { data }: Props = $props();

	let openAlert = $state(false);
	let alertData = $state<Alert | undefined>(undefined);

	const form = superForm(data, {
		validators: zodClient(passwordSchema),
		onResult({ result, cancel }) {
			if ([200, 204, 302].indexOf(result.status || 0) === -1) {
				alertData = {
					title: '비밀번호 재설정 도중 오류가 발생했습니다.',
					description: '고객센터에 문의해주시기 바랍니다.',
				};
				openAlert = true;
				cancel();
			} else {
				alertData = {
					title: '비밀번호가 재설정되었습니다.',
					description: '변경된 비밀번호로 다시 로그인하시기 바랍니다.',
					onAction: () => {
						window.location.href = '/login';
					},
				};
				openAlert = true;
			}
		},
	});
	const { form: formData, enhance, constraints } = form;
</script>

<Layout
	title="비밀번호 재설정"
	showSearchPanel={false}
	showUserPanel={false}
	bind:openAlert
	alert={alertData}>
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
			<Form.Button>비밀번호 재설정</Form.Button>
		</form>
	</Section>
</Layout>
