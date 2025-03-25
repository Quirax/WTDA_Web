<svelte:options runes />

<script lang="ts" module>
	export const enum UserInfoFor {
		REGISTRATION,
		INFO_VIEW,
		INFO_EDIT,
	}
</script>

<script lang="ts">
	import { formSchema, userSchema, type FormSchema, type UserSchema } from '$lib/schema/register';

	import Layout from '../../Layout.svelte';
	import Section from '../../components/Section.svelte';
	import H2 from '$lib/components/typo/h2.svelte';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';

	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	interface Props {
		data: SuperValidated<Infer<FormSchema | UserSchema>>;
		for: UserInfoFor;
	}

	const { data, for: userInfoFor }: Props = $props();

	let openAlert = $state(false);
	let title = $state('');

	switch (userInfoFor) {
		case UserInfoFor.REGISTRATION: {
			title = '회원가입';
			break;
		}
		case UserInfoFor.INFO_VIEW: {
			title = '회원정보';
			break;
		}
		case UserInfoFor.INFO_EDIT: {
			title = '회원정보 수정';
			break;
		}
	}

	const form = superForm(data, {
		validators: zodClient(userInfoFor === UserInfoFor.REGISTRATION ? formSchema : userSchema),
		onResult({ result, cancel }) {
			if ([200, 204, 302].indexOf(result.status || 0) === -1) {
				openAlert = true;
				cancel();
			}
		},
	});
	const { form: formData, enhance, constraints } = form;
</script>

<Layout
	{title}
	showSearchPanel={userInfoFor !== UserInfoFor.REGISTRATION}
	showUserPanel={userInfoFor !== UserInfoFor.REGISTRATION}
	bind:openAlert
	alert={{
		title: `${title} 처리 도중 오류가 발생했습니다.`,
		description: '고객센터에 문의해주시기 바랍니다.',
	}}>
	<Section>
		<H2>{title}</H2>
		<form method="POST" use:enhance class="w-2/3" action="?/do">
			{#if userInfoFor === UserInfoFor.REGISTRATION}
				<Form.Field {form} name="email" class="mt-4 flex flex-col space-y-1">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label><Badge variant="destructive">필수</Badge> 이메일</Form.Label>
							<!-- prettier-ignore -->
							<Input
								{...props}
								bind:value={($formData as Infer<FormSchema>).email}
								{...$constraints.email} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			{/if}
			{#if userInfoFor !== UserInfoFor.INFO_VIEW}
				<Form.Field {form} name="password" class="mt-4 flex flex-col space-y-1">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label><Badge variant="destructive">필수</Badge> 비밀번호</Form.Label>
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
				<Form.Field {form} name="passwordConfirm" class="mt-4 flex flex-col space-y-1">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label><Badge variant="destructive">필수</Badge> 비밀번호 확인</Form.Label>
							<Input
								{...props}
								type="password"
								bind:value={$formData.passwordConfirm}
								{...$constraints.passwordConfirm} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			{/if}
			<Form.Field {form} name="username" class="my-4 flex flex-col space-y-1">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>
							{#if userInfoFor !== UserInfoFor.INFO_VIEW}
								<Badge variant="destructive">필수</Badge>
							{/if}
							닉네임
						</Form.Label>
						<Input
							{...props}
							bind:value={$formData.username}
							{...$constraints.username}
							disabled={userInfoFor !== UserInfoFor.INFO_EDIT} />
					{/snippet}
				</Form.Control>
				{#if userInfoFor === UserInfoFor.INFO_EDIT}
					<Form.Description>최대 20자</Form.Description>
					<Form.FieldErrors />
				{/if}
			</Form.Field>
			{#if userInfoFor !== UserInfoFor.REGISTRATION}
				<Form.Field {form} name="username" class="my-4 flex flex-col space-y-1">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>
								{#if userInfoFor !== UserInfoFor.INFO_VIEW}
									<Badge variant="destructive">필수</Badge>
								{/if}
								닉네임
							</Form.Label>
							<Input {...props} bind:value={$formData.username} {...$constraints.username} />
						{/snippet}
					</Form.Control>
					<Form.Description>최대 20자</Form.Description>
					<Form.FieldErrors />
				</Form.Field>
			{/if}
			{#if userInfoFor === UserInfoFor.REGISTRATION}
				<div class="mb-4 border-2">
					<Form.Field {form} name="agree_eula" class="p-4">
						<div class="flex flex-row items-center space-y-0 space-x-3">
							<Form.Control>
								{#snippet children({ props })}
									<!-- prettier-ignore -->
									<Checkbox {...props} bind:checked={($formData as Infer<FormSchema>).agree_eula} />
									<div class="space-y-1 leading-none">
										<Form.Label>
											<Badge variant="destructive">필수</Badge> 뭐하지공방의 이용약관에 동의합니다.
										</Form.Label>
									</div>
									<!-- Checkbox 사용 시 별도의 hidden field 필요 -->
									<!-- ref: https://stackoverflow.com/a/78404901 -->
									<input
										name={props.name}
										value={($formData as Infer<FormSchema>).agree_eula}
										hidden />
								{/snippet}
							</Form.Control>
						</div>
						<Form.FieldErrors />
					</Form.Field>
					<Form.Field {form} name="agree_privacypolicy" class="p-4">
						<div class="flex flex-row items-center space-y-0 space-x-3">
							<Form.Control>
								{#snippet children({ props })}
									<!-- prettier-ignore -->
									<Checkbox
										{...props}
										bind:checked={($formData as Infer<FormSchema>).agree_privacypolicy} />
									<div class="space-y-1 leading-none">
										<Form.Label>
											<Badge variant="destructive">필수</Badge> 뭐하지공방의 개인정보처리방침에 동의합니다.
										</Form.Label>
									</div>
									<input
										name={props.name}
										value={($formData as Infer<FormSchema>).agree_privacypolicy}
										hidden />
								{/snippet}
							</Form.Control>
						</div>
						<Form.FieldErrors />
					</Form.Field>
					<Form.Field {form} name="agree_marketing" class="p-4">
						<div class="flex flex-row items-center space-y-0 space-x-3">
							<Form.Control>
								{#snippet children({ props })}
									<!-- prettier-ignore -->
									<Checkbox
										{...props}
										bind:checked={($formData as Infer<FormSchema>).agree_marketing} />
									<div class="space-y-1 leading-none">
										<Form.Label>뭐하지공방에서 제공하는 마케팅 정보 알림을 받겠습니다.</Form.Label>
									</div>
									<input
										name={props.name}
										value={($formData as Infer<FormSchema>).agree_marketing}
										hidden />
								{/snippet}
							</Form.Control>
						</div>
						<Form.FieldErrors />
					</Form.Field>
				</div>
			{/if}
			{#if userInfoFor !== UserInfoFor.INFO_VIEW}
				<Form.Button>가입하기</Form.Button>
			{/if}
		</form>
	</Section>
</Layout>
