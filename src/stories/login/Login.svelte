<svelte:options runes />

<script lang="ts">
	import H2 from '$lib/components/typo/h2.svelte';
	import * as Form from '$lib/components/ui/form';
	import Input from '$lib/components/ui/input/input.svelte';
	import { formSchema, type FormSchema } from '$lib/schema/login';
	import Section from '$stories/components/Section.svelte';
	import Layout, { type Alert } from '$stories/Layout.svelte';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	interface Props {
		data: SuperValidated<Infer<FormSchema>>;
	}

	const {
		data = {
			id: '',
			valid: false,
			posted: false,
			errors: { _errors: undefined },
			data: {
				email: '',
				password: '',
			},
		},
	}: Props = $props();

	let openAlert = $state(false);
	let alertData = $state<Alert | undefined>(undefined);

	const form = superForm(data, {
		validators: zodClient(formSchema),
		onResult({ result, cancel }) {
			if ([200, 204, 302].indexOf(result.status || 0) === -1) {
				if (result.status === 404)
					alertData = {
						title: '입력하신 이메일 또는 비밀번호가 틀렸습니다.',
						description:
							'회원가입 시 사용한 이메일 또는 비밀번호가 맞는지 다시 확인하시기 바랍니다. 회원가입을 하지 않으셨다면 회원가입을 하시기 바랍니다. 비밀번호를 잊어버렸다면 비밀번호를 재설정하시기 바랍니다.',
					};
				else
					alertData = {
						title: '로그인 처리 도중 오류가 발생했습니다.',
						description: '고객센터에 문의해주시기 바랍니다.',
					};
				openAlert = true;
				cancel();
			}
		},
	});
	const { form: formData, enhance, constraints } = form;
</script>

<Layout title="로그인" bind:openAlert alert={alertData}>
	<Section>
		<H2>로그인</H2>
		<form method="POST" use:enhance class="w-2/3" action="?">
			<Form.Field {form} name="email" class="flex flex-col my-4 space-y-1">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>이메일</Form.Label>
						<Input {...props} bind:value={$formData.email} {...$constraints.email} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="password" class="flex flex-col mb-4 space-y-1">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>비밀번호</Form.Label>
						<Input
							{...props}
							type="password"
							bind:value={$formData.password}
							{...$constraints.password} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Button>로그인</Form.Button>
		</form>
	</Section>
</Layout>
