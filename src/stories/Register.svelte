<svelte:options runes />

<script lang="ts">
	import { formSchema, type FormSchema } from '$lib/schema/register';

	import { fn } from '@storybook/test';

	import Layout from './Layout.svelte';
	import Section from './components/Section.svelte';
	import H2 from '$lib/components/typo/h2.svelte';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import Button from '$lib/components/ui/button/button.svelte';

	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zod, zodClient } from 'sveltekit-superforms/adapters';

	interface Props {
		onSubmit?: (data: App.User) => boolean;
		data: SuperValidated<Infer<FormSchema>>;
	}

	const {
		onSubmit = fn(),
		data = {
			id: '',
			valid: false,
			posted: false,
			errors: { _errors: undefined },
			data: {
				username: '',
				email: '',
				password: '',
				passwordConfirm: '',
				agree_eula: false,
				agree_privacypolicy: false,
				agree_marketing: false,
			},
		},
	}: Props = $props();

	const form = superForm(data, { validators: zod(formSchema) });
	const { form: formData, enhance, validateForm } = form;

	const onValidate = () =>
		validateForm({ update: true }).then((result) => {
			if (result.valid) console.log('ㅛㄷㄴ');
		});
</script>

<Layout title="회원가입" showSearchPanel={false} showUserPanel={false}>
	<Section>
		<H2>회원가입</H2>
		<form method="POST" use:enhance class="w-2/3">
			<Form.Field {form} name="email">
				<Form.Control let:attrs>
					<Form.Label><Badge variant="destructive">필수</Badge> 이메일</Form.Label>
					<Input {...attrs} bind:value={$formData.email} />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="password">
				<Form.Control let:attrs>
					<Form.Label><Badge variant="destructive">필수</Badge> 비밀번호</Form.Label>
					<Input {...attrs} bind:value={$formData.password} />
				</Form.Control>
				<Form.Description>최소 8자 이상</Form.Description>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="passwordConfirm">
				<Form.Control let:attrs>
					<Form.Label><Badge variant="destructive">필수</Badge> 비밀번호 확인</Form.Label>
					<Input {...attrs} bind:value={$formData.passwordConfirm} />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="username">
				<Form.Control let:attrs>
					<Form.Label><Badge variant="destructive">필수</Badge> 닉네임</Form.Label>
					<Input {...attrs} bind:value={$formData.username} />
				</Form.Control>
				<Form.Description>최대 20자</Form.Description>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="agree_eula">
				<Form.Control let:attrs>
					<Form.Label>
						<Badge variant="destructive">필수</Badge> 뭐하지공방의 이용약관에 동의합니다.
					</Form.Label>
					<Input {...attrs} bind:value={$formData.agree_eula} />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="agree_privacypolicy">
				<Form.Control let:attrs>
					<Form.Label>
						<Badge variant="destructive">필수</Badge> 뭐하지공방의 개인정보처리방침에 동의합니다.
					</Form.Label>
					<Input {...attrs} bind:value={$formData.agree_privacypolicy} />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="agree_marketing">
				<Form.Control let:attrs>
					<Form.Label>뭐하지공방에서 제공하는 마케팅 정보 알림을 받겠습니다.</Form.Label>
					<Input {...attrs} bind:value={$formData.agree_marketing} />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Button onclick={onValidate}>가입하기</Button>
		</form>
	</Section>
</Layout>
