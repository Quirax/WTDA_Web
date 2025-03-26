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
	import { layoutStore } from '$lib/context';

	interface Props {
		data: SuperValidated<Infer<FormSchema | UserSchema>>;
		for: UserInfoFor;
	}

	const { data, for: userInfoFor }: Props = $props();

	let title = $state('');

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

	$effect.pre(() => {
		layoutStore.update((value) => {
			const newValue = { ...value };

			newValue.title = title;
			newValue.alert = {
				title: `${title} 처리 도중 오류가 발생했습니다.`,
				description: '고객센터에 문의해주시기 바랍니다.',
			};
			newValue.showSearchPanel = userInfoFor !== UserInfoFor.REGISTRATION;
			newValue.showUserPanel = userInfoFor !== UserInfoFor.REGISTRATION;

			return newValue;
		});
	});

	const form = superForm(data, {
		validators: zodClient(userInfoFor === UserInfoFor.REGISTRATION ? formSchema : userSchema),
		onResult({ result, cancel }) {
			if ([200, 204, 302].indexOf(result.status || 0) === -1) {
				console.error(result);
				layoutStore.update((value) => {
					const newValue = { ...value };

					newValue.openAlert = true;

					return newValue;
				});
				cancel();
			}
		},
	});
	const { form: formData, enhance, constraints } = form;

	// ref: https://svelte.dev/playground/11303854cb6247ae99514acad96190b6?version=5.25.3
	// ref: https://stackoverflow.com/a/11058858
	let sourceImage = $state<string>();
	let openCropper = $state(false);

	const onDropFile = ({ detail }: any) => {
		const { acceptedFiles } = detail;

		let imageFile = acceptedFiles[0];

		if (!imageFile) return;

		let reader = new FileReader();
		reader.onload = (e) => {
			if (!e.target?.result) sourceImage = '';
			else if (typeof e.target.result === 'string') sourceImage = e.target.result;
			else sourceImage = String.fromCharCode(...new Uint16Array(e.target.result));

			openCropper = true;
		};
		reader.readAsDataURL(imageFile);
	};

	let cropper = $state<ReturnType<typeof Cropper>>();

	// ref: https://superforms.rocks/concepts/tainted
	const onSetProfileImage = () => {
		if (!cropper) return;

		cropper.getImage().then((destImage) => {
			if (!destImage) return;

			formData.update(($formData: Infer<UserSchema>) => {
				$formData.profileImage = destImage;
				return $formData;
			});

			openCropper = false;
		});
	};

	const removeProfileImage = () => {
		formData.update(($formData: Infer<UserSchema>) => {
			$formData.profileImage = '';
			return $formData;
		});
	};
</script>

<Section>
	<H2>{title}</H2>
	<form method="POST" use:enhance class="w-full sm:w-2/3" action="?/do">
		{#if userInfoFor === UserInfoFor.REGISTRATION}
			<Form.Field {form} name="email" class="flex flex-col mt-4 space-y-1">
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
			<Form.Field {form} name="password" class="flex flex-col mt-4 space-y-1">
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
							placeholder="(기존 비밀번호 유지)" />
					{/snippet}
				</Form.Control>
				<Form.Description>변경하려는 경우에만 입력, 최소 8자 이상</Form.Description>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="passwordConfirm" class="flex flex-col mt-4 space-y-1">
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
							placeholder="(기존 비밀번호 유지)" />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
		{/if}
		<Form.Field {form} name="username" class="flex flex-col my-4 space-y-1">
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
						class="text-foreground opacity-100!"
						disabled={userInfoFor !== UserInfoFor.INFO_EDIT} />
				{/snippet}
			</Form.Control>
			{#if userInfoFor === UserInfoFor.INFO_EDIT}
				<Form.Description>최대 20자</Form.Description>
				<Form.FieldErrors />
			{/if}
		</Form.Field>
		{#if userInfoFor !== UserInfoFor.REGISTRATION}
			<Form.Field {form} name="profileImage" class="flex flex-col my-4 space-y-1">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>프로필 이미지</Form.Label>
						{#if ($formData as Infer<UserSchema>).profileImage}
							<div class="relative border rounded-full size-50">
								<img
									src={($formData as Infer<UserSchema>).profileImage}
									alt="프로필 이미지"
									class="rounded-full size-full" />
								{#if userInfoFor === UserInfoFor.INFO_EDIT}
									<Button
										variant="outline"
										size="icon"
										onclick={removeProfileImage}
										class="absolute top-0 right-0 size-7">
										<X />
									</Button>
									<input
										name={props.name}
										value={($formData as Infer<UserSchema>).profileImage}
										hidden />
								{/if}
							</div>
						{:else if userInfoFor === UserInfoFor.INFO_EDIT}
							<Dropzone id={props.id} accept={imageFormat} on:drop={onDropFile} multiple={false}>
								<p>여기로 이미지를 드래그하거나, 클릭하여 이미지를 선택하세요.</p>
							</Dropzone>
							<input name={props.name} value="" hidden />
						{:else}
							<User class="border size-50" />
						{/if}
					{/snippet}
				</Form.Control>
				{#if userInfoFor === UserInfoFor.INFO_EDIT}
					<Form.Description>변경된 프로필 이미지는 저장 후에 반영됩니다.</Form.Description>
					<Form.FieldErrors />
				{/if}
			</Form.Field>
		{/if}
		<div class="mb-4 border-2">
			{#if userInfoFor === UserInfoFor.REGISTRATION}
				<Form.Field {form} name="agree_eula" class="p-4">
					<div class="flex flex-row items-center space-x-3 space-y-0">
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
					<div class="flex flex-row items-center space-x-3 space-y-0">
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
				<div class="flex flex-row items-center space-x-3 space-y-0">
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
			<Button href="/user/info/auth">변경하기</Button>
		{:else}
			<Form.Button>저장하기</Form.Button>
		{/if}
	</form>
</Section>

<Dialog.Root bind:open={openCropper}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>프로필 이미지 자르기</Dialog.Title>
			<Dialog.Description>
				프로필로 사용할 영역을 선택한 뒤 '완료' 버튼을 누르면 지정됩니다. 변경된 프로필 이미지는
				저장 후에 반영됩니다.
			</Dialog.Description>
		</Dialog.Header>
		<Cropper
			image={sourceImage || ''}
			maxZoom={10}
			aspect={1}
			shape="round"
			crop_window_margin={30}
			overlay_options={{ show_third_lines: true }}
			bind:this={cropper} />
		<Dialog.Footer>
			<Button onclick={onSetProfileImage}>확인</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
