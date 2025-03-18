<svelte:options runes />

<script lang="ts">
	import { formSchema, type FormSchema } from '$lib/schema/register';

	import Layout from './Layout.svelte';
	import Section from './components/Section.svelte';
	import H2 from '$lib/components/typo/h2.svelte';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';

	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
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

	const form = superForm(data, {
		validators: zodClient(formSchema),
	});
	const { form: formData, enhance, constraints } = form;
</script>

<Layout title="회원가입" showSearchPanel={false} showUserPanel={false}>
	<Section>
		<H2>회원가입</H2>
		<form method="POST" use:enhance class="w-2/3">
			<Form.Field {form} name="email" class="my-4 flex flex-col space-y-1">
				<Form.Control let:attrs>
					<Form.Label><Badge variant="destructive">필수</Badge> 이메일</Form.Label>
					<Input {...attrs} bind:value={$formData.email} {...$constraints.email} />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="password" class="mb-4 flex flex-col space-y-1">
				<Form.Control let:attrs>
					<Form.Label><Badge variant="destructive">필수</Badge> 비밀번호</Form.Label>
					<Input
						{...attrs}
						type="password"
						bind:value={$formData.password}
						{...$constraints.password} />
				</Form.Control>
				<Form.Description>최소 8자 이상</Form.Description>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="passwordConfirm" class="mb-4 flex flex-col space-y-1">
				<Form.Control let:attrs>
					<Form.Label><Badge variant="destructive">필수</Badge> 비밀번호 확인</Form.Label>
					<Input
						{...attrs}
						type="password"
						bind:value={$formData.passwordConfirm}
						{...$constraints.passwordConfirm} />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="username" class="mb-4 flex flex-col space-y-1">
				<Form.Control let:attrs>
					<Form.Label><Badge variant="destructive">필수</Badge> 닉네임</Form.Label>
					<Input {...attrs} bind:value={$formData.username} {...$constraints.username} />
				</Form.Control>
				<Form.Description>최대 20자</Form.Description>
				<Form.FieldErrors />
			</Form.Field>
			<div class="mb-4 border-2">
				<Form.Field {form} name="agree_eula" class="p-4">
					<div class="flex flex-row items-center space-y-0 space-x-3">
						<Form.Control let:attrs>
							<Checkbox {...attrs} bind:checked={$formData.agree_eula} />
							<div class="space-y-1 leading-none">
								<Form.Label>
									<Badge variant="destructive">필수</Badge> 뭐하지공방의 이용약관에 동의합니다.
								</Form.Label>
							</div>
							<!-- Checkbox 사용 시 별도의 hidden field 필요 -->
							<!-- ref: https://stackoverflow.com/a/78404901 -->
							<input name={attrs.name} value={$formData.agree_eula} hidden />
						</Form.Control>
					</div>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field {form} name="agree_privacypolicy" class="p-4">
					<div class="flex flex-row items-center space-y-0 space-x-3">
						<Form.Control let:attrs>
							<Checkbox {...attrs} bind:checked={$formData.agree_privacypolicy} />
							<div class="space-y-1 leading-none">
								<Form.Label>
									<Badge variant="destructive">필수</Badge> 뭐하지공방의 개인정보처리방침에 동의합니다.
								</Form.Label>
							</div>
							<input name={attrs.name} value={$formData.agree_privacypolicy} hidden />
						</Form.Control>
					</div>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field {form} name="agree_marketing" class="p-4">
					<div class="flex flex-row items-center space-y-0 space-x-3">
						<Form.Control let:attrs>
							<Checkbox {...attrs} bind:checked={$formData.agree_marketing} />
							<div class="space-y-1 leading-none">
								<Form.Label>뭐하지공방에서 제공하는 마케팅 정보 알림을 받겠습니다.</Form.Label>
							</div>
							<input name={attrs.name} value={$formData.agree_marketing} hidden />
						</Form.Control>
					</div>
					<Form.FieldErrors />
				</Form.Field>
			</div>
			<Form.Button>가입하기</Form.Button>
		</form>
	</Section>
</Layout>
