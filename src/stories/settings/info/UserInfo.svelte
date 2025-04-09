<svelte:options runes />

<script lang="ts" module>
	export const enum UserInfoFor {
		REGISTRATION,
		INFO_VIEW,
		INFO_EDIT,
	}
</script>

<script lang="ts">
	import { formSchema, userSchema, type FormSchema, type UserSchema } from '$lib/schema/userInfo';

	import Section from '../../components/Section.svelte';
	import H2 from '$lib/components/typo/h2.svelte';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
	import * as Dialog from '$lib/components/ui/dialog';

	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import User from 'lucide-svelte/icons/user';
	import Button from '$lib/components/ui/button/button.svelte';
	import { imageFormat } from '$lib/config';
	import Cropper from '$lib/components/cropper';
	import Dropzone from 'svelte-file-dropzone';
	import { X } from 'lucide-svelte';
	import Header from '$stories/components/Header.svelte';
	import AlertDialog from '$stories/components/AlertDialog.svelte';
	import Ul from '$lib/components/typo/ul.svelte';
	import P from '$lib/components/typo/p.svelte';
	import { goto } from '$app/navigation';

	interface Props {
		data: SuperValidated<Infer<FormSchema | UserSchema>>;
		for: UserInfoFor;
	}

	const { data, for: userInfoFor }: Props = $props();

	let title = $state('');
	let openErrorAlert = $state(false);

	switch (userInfoFor) {
		case UserInfoFor.REGISTRATION: {
			title = '회원가입';
			break;
		}
		case UserInfoFor.INFO_VIEW: {
			title = '사용자 정보';
			break;
		}
		case UserInfoFor.INFO_EDIT: {
			title = '사용자 정보 변경';
			break;
		}
	}

	const form = superForm(data, {
		validators: zodClient(userInfoFor === UserInfoFor.REGISTRATION ? formSchema : userSchema),
		onResult({ result, cancel }) {
			if ([200, 204, 302].indexOf(result.status || 0) === -1) {
				console.error(result);
				openErrorAlert = true;
				cancel();
			}
		},
	});
	const { form: formData, enhance, constraints } = form;

	let openBeforeDeactivationAlert = $state(false);
	let openAfterDeactivationAlert = $state(false);
	let openErrorOnDeactivationAlert = $state(false);

	const onDeactivation = async () => {
		const result = await fetch('?/deactivate', {
			method: 'post',
			body: new FormData(),
		}).then((r) => r.json());

		if ([200, 204].indexOf(result.status || 0) === -1) {
			if (result.status !== 302) openErrorOnDeactivationAlert = true;
			return;
		}

		openAfterDeactivationAlert = true;
	};
</script>

<Header {title} />

<Section>
	<H2>{title}</H2>
	<form method="POST" use:enhance class="w-full sm:w-2/3" action="?/do">
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
						<Form.Label>
							{#if userInfoFor !== UserInfoFor.INFO_EDIT}
								<Badge variant="destructive">필수</Badge>
							{/if}
							비밀번호
						</Form.Label>
						<Input
							{...props}
							type="password"
							bind:value={$formData.password}
							{...$constraints.password}
							placeholder={(userInfoFor === UserInfoFor.INFO_EDIT && '(기존 비밀번호 유지)') ||
								''} />
					{/snippet}
				</Form.Control>
				<Form.Description>
					{(userInfoFor === UserInfoFor.INFO_EDIT && '변경하려는 경우에만 입력, ') || ''}최소 8자
					이상
				</Form.Description>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="passwordConfirm" class="mt-4 flex flex-col space-y-1">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>
							{#if userInfoFor !== UserInfoFor.INFO_EDIT}
								<Badge variant="destructive">필수</Badge>
							{/if}
							비밀번호 확인
						</Form.Label>
						<Input
							{...props}
							type="password"
							bind:value={$formData.passwordConfirm}
							{...$constraints.passwordConfirm}
							placeholder={(userInfoFor === UserInfoFor.INFO_EDIT && '(기존 비밀번호 유지)') ||
								''} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
		{/if}
		{#if userInfoFor === UserInfoFor.REGISTRATION}
			<Form.Field {form} name="username" class="my-4 flex flex-col space-y-1">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>
							<Badge variant="destructive">필수</Badge>
							닉네임
						</Form.Label>
						<!-- prettier-ignore -->
						<Input
							{...props}
							bind:value={($formData as Infer<FormSchema>).username}
							{...$constraints.username}
							class="text-foreground opacity-100!" />
					{/snippet}
				</Form.Control>
				<Form.Description>최대 20자</Form.Description>
				<Form.FieldErrors />
			</Form.Field>
		{/if}
		<div class="my-4 border-2">
			{#if userInfoFor === UserInfoFor.REGISTRATION}
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
			{/if}
			<Form.Field {form} name="agree_marketing" class="p-4">
				<div class="flex flex-row items-center space-y-0 space-x-3">
					<Form.Control>
						{#snippet children({ props })}
							<!-- prettier-ignore -->
							<Checkbox
										{...props}
										bind:checked={($formData as Infer<FormSchema>).agree_marketing} disabled={userInfoFor === UserInfoFor.INFO_VIEW} />
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
		{#if userInfoFor === UserInfoFor.REGISTRATION}
			<Form.Button>가입하기</Form.Button>
		{:else if userInfoFor === UserInfoFor.INFO_VIEW}
			<Button href="/settings/info/auth">변경하기</Button>
		{:else}
			<Form.Button>저장하기</Form.Button>
			<Button variant="destructive" onclick={() => (openBeforeDeactivationAlert = true)}>
				계정 비활성화하기
			</Button>
		{/if}
	</form>
</Section>

{#snippet WarningBeforeDeactivation()}
	<Ul>
		<li>
			<span class="text-destructive font-bold">
				프로필과 남아있는 모든 게시물(커미션 타입, 의뢰 등)은 그대로 보존됩니다.
			</span>
			(단, 프로필 이미지와 닉네임은 삭제되며, 다른 사용자가 커미션 신청이나 의뢰 지원을 할 수 없습니다.)
			이를 원하지 않으시는 경우
			<span class="text-foreground font-bold">
				먼저 프로필을 초기화하고 게시물을 직접 삭제하시기 바랍니다.
			</span>
		</li>
		<li>
			다른 사용자와 진행하던 <span class="text-foreground font-bold">
				모든 커미션은 모두 취소되며, 즉시 환불 조치됩니다.
			</span>
		</li>
		<li>
			<span class="text-foreground font-bold">적립된 모든 수익금은 곧바로 정산이 진행됩니다.</span>
		</li>
		<li>
			<span class="text-destructive font-bold">
				사용하지 않은 포인트는 환불되지 않으며, 뭐하지공방에 귀속됩니다.
			</span>
		</li>
		<li>
			한 번 비활성화된 계정은 <span class="text-destructive font-bold">복구가 불가능하며,</span>
			이 계정으로 다시 로그인할 수 없습니다.
		</li>
	</Ul>
	<P>정말로 계정을 비활성화하시겠습니까?</P>
{/snippet}

<AlertDialog
	title={`${title} 처리 도중 오류가 발생했습니다.`}
	description="고객센터에 문의해주시기 바랍니다."
	bind:open={openErrorAlert} />
<AlertDialog
	title="계정 비활성화 전 꼭 읽어보세요"
	description={WarningBeforeDeactivation}
	cancel={true}
	onAction={onDeactivation}
	bind:open={openBeforeDeactivationAlert} />
<AlertDialog
	title="계정 비활성화 완료"
	description="계정을 비활성화하였습니다. 그동안 뭐하지공방과 함께해주셔서 감사합니다."
	onAction={() => {
		window.location.href = '/';
	}}
	bind:open={openAfterDeactivationAlert} />
<AlertDialog
	title="계정 비활성화 처리 도중 오류가 발생했습니다."
	description="고객센터에 문의해주시기 바랍니다."
	bind:open={openErrorOnDeactivationAlert} />
