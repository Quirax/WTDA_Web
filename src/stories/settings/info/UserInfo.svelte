<svelte:options runes />

<script lang="ts" module>
	export const enum UserInfoFor {
		REGISTRATION = 'REGISTRATION',
		INFO_VIEW = 'INFO_VIEW',
		INFO_EDIT = 'INFO_EDIT',
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
	import { UserStatus } from '@app';
	import { H3 } from '$lib/components/typo';
	import Calendar from '$lib/components/ui/calendar/calendar.svelte';
	import { fromDate, getLocalTimeZone, today } from '@internationalized/date';
	import CalendarWithSelects from '$lib/components/calendar/CalendarWithSelects.svelte';
	import { deserialize } from '$app/forms';
	import Tooltip from '$lib/components/tooltip/Tooltip.svelte';
	import { m } from '$lib/messages';
	import type { Snippet } from 'svelte';
	import { replace } from '$lib/utils.svelte';

	interface Props {
		data: SuperValidated<Infer<FormSchema | UserSchema>>;
		for: UserInfoFor;
		auth?: {
			status: UserStatus;
			birthday: Date | null;
			authExpiresAt: Date | null;
		};
	}

	const { data, for: userInfoFor, auth: prevAuth }: Props = $props();

	let auth = $state(prevAuth);

	let title = $derived(m['USER_INFO.TITLE']({ for: userInfoFor }));
	let openErrorAlert = $state(false);

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

	let openAuthenticationDialog = $state(false);
	let openAuthenticationCompletedAlert = $state(false);
	let openErrorOnAuthenticateAlert = $state(false);
	let birthday = $state(prevAuth?.birthday ?? new Date());

	const onAuthenticate = async () => {
		openAuthenticationDialog = false;

		const formData = new FormData();

		formData.append('birthday', birthday.getTime().toString());

		const result = await fetch('?/authenticate', {
			method: 'post',
			body: formData,
		})
			.then((r) => r.text())
			.then((r) => deserialize(r));

		if (result.type === 'success') {
			auth = result.data!.auth as typeof auth;
			openAuthenticationCompletedAlert = true;
		} else {
			console.error(result);
			openErrorOnAuthenticateAlert = true;
		}
	};
</script>

<Header {title} />

<Section>
	<H2>{title}</H2>
	<form method="POST" use:enhance class="w-full lg:w-2/3" action="?/do">
		{#if userInfoFor === UserInfoFor.REGISTRATION}
			<Form.Field {form} name="email" class="mt-4 flex flex-col space-y-1">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>
							<Badge variant="destructive">{m['FORM.REQUIRED']()}</Badge>
							{m['USER_INFO.EMAIL']()}
						</Form.Label>
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
								<Badge variant="destructive">{m['FORM.REQUIRED']()}</Badge>
							{/if}
							{m['USER_INFO.PASSWORD']()}
						</Form.Label>
						<Input
							{...props}
							type="password"
							bind:value={$formData.password}
							{...$constraints.password}
							placeholder={(userInfoFor === UserInfoFor.INFO_EDIT &&
								m['USER_INFO.KEEP_OLD_PASSWORD']()) ||
								''} />
					{/snippet}
				</Form.Control>
				<Form.Description>
					{(userInfoFor === UserInfoFor.INFO_EDIT && `${m['USER_INFO.INPUT_WHEN_CHANGE']()}, `) ||
						''}{m['USER_INFO.PASSWORD_MIN_LENGTH']()}
				</Form.Description>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="passwordConfirm" class="mt-4 flex flex-col space-y-1">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>
							{#if userInfoFor !== UserInfoFor.INFO_EDIT}
								<Badge variant="destructive">{m['FORM.REQUIRED']()}</Badge>
							{/if}
							{m['USER_INFO.PASSWORD_CONFIRM']()}
						</Form.Label>
						<Input
							{...props}
							type="password"
							bind:value={$formData.passwordConfirm}
							{...$constraints.passwordConfirm}
							placeholder={(userInfoFor === UserInfoFor.INFO_EDIT &&
								m['USER_INFO.KEEP_OLD_PASSWORD']()) ||
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
							<Badge variant="destructive">{m['FORM.REQUIRED']()}</Badge>
							{m['USER_INFO.USERNAME']()}
						</Form.Label>
						<!-- prettier-ignore -->
						<Input
							{...props}
							bind:value={($formData as Infer<FormSchema>).username}
							{...$constraints.username}
							class="text-foreground opacity-100!" />
					{/snippet}
				</Form.Control>
				<Form.Description>{m['USER_INFO.USERNAME_MAX_LENGTH']()}</Form.Description>
				<Form.FieldErrors />
			</Form.Field>
		{/if}
		{#if userInfoFor !== UserInfoFor.REGISTRATION}
			{@const isAuthenticated =
				auth?.status === UserStatus.AUTHENTICATED &&
				!!auth?.authExpiresAt &&
				auth?.authExpiresAt >= new Date()}
			{@const isNotAdult =
				!auth?.birthday || auth.birthday.getFullYear() + 19 > new Date().getFullYear()}
			<div class="my-4 space-y-4 border-2 p-4">
				<div class="flex flex-row items-center space-y-0 space-x-3">
					<Button
						onclick={() => (openAuthenticationDialog = true)}
						disabled={userInfoFor === UserInfoFor.INFO_VIEW}>
						{m['USER_INFO.AUTHENTICATION.TITLE']()}
					</Button>
					<span class="text-sm">
						{isAuthenticated
							? m['USER_INFO.AUTHENTICATION.AUTHENTICATED']()
							: m['USER_INFO.AUTHENTICATION.UNAUTHENTICATED']()}
						{#if auth?.authExpiresAt}
							({m['USER_INFO.AUTHENTICATION.EXPIRES_AT']({
								year: auth.authExpiresAt.getFullYear(),
								month: auth.authExpiresAt.getMonth() + 1,
								date: auth.authExpiresAt.getDate(),
							})})
						{/if}
					</span>
				</div>
				<Form.Field {form} name="display_adult_contents">
					<div class="flex flex-row items-center space-y-0 space-x-3">
						<Form.Control>
							{#snippet children({ props })}
								<!-- prettier-ignore -->
								<Checkbox {...props} bind:checked={() => (isAuthenticated && !isNotAdult && ($formData as Infer<UserSchema>).display_adult_contents) || false, (v) => {
									($formData as Infer<UserSchema>).display_adult_contents = isAuthenticated && v
									if(!v) ($formData as Infer<UserSchema>).display_grotesque_contents = false
								}} disabled={!isAuthenticated || isNotAdult || userInfoFor === UserInfoFor.INFO_VIEW} />
								<div class="space-y-1 leading-none">
									<Tooltip
										text={m['USER_INFO.DISPLAY_ADULT_CONTENTS.TOOLTIP']()}
										disabled={isAuthenticated && !isNotAdult}>
										<Form.Label>{m['USER_INFO.DISPLAY_ADULT_CONTENTS.TITLE']()}</Form.Label>
									</Tooltip>
								</div>
								<input
									name={props.name}
									value={($formData as Infer<UserSchema>).display_adult_contents}
									hidden />
							{/snippet}
						</Form.Control>
					</div>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field {form} name="display_grotesque_contents" class="ml-8">
					<div class="flex flex-row items-center space-y-0 space-x-3">
						<Form.Control>
							{#snippet children({ props })}
								<!-- prettier-ignore -->
								<Checkbox {...props} bind:checked={() => (isAuthenticated && !isNotAdult && ($formData as Infer<UserSchema>).display_grotesque_contents) || false, (v) => {
									($formData as Infer<UserSchema>).display_grotesque_contents = isAuthenticated && ($formData as Infer<UserSchema>).display_adult_contents && v
								}} disabled={!isAuthenticated || isNotAdult || userInfoFor === UserInfoFor.INFO_VIEW || !($formData as Infer<UserSchema>).display_adult_contents} />
								<div class="space-y-1 leading-none">
									<Tooltip
										text={m['USER_INFO.DISPLAY_GROTESQUE_CONTENTS.TOOLTIP']()}
										disabled={isAuthenticated && !isNotAdult}>
										<Form.Label>{m['USER_INFO.DISPLAY_GROTESQUE_CONTENTS.TITLE']()}</Form.Label>
									</Tooltip>
								</div>
								<input
									name={props.name}
									value={($formData as Infer<UserSchema>).display_grotesque_contents}
									hidden />
							{/snippet}
						</Form.Control>
					</div>
					<Form.FieldErrors />
				</Form.Field>
			</div>
		{/if}
		{#if userInfoFor !== UserInfoFor.REGISTRATION}
			<Form.Field {form} name="agree_notification">
				<div class="flex flex-row items-center space-y-0 space-x-3">
					<Form.Control>
						{#snippet children({ props })}
							<!-- prettier-ignore -->
							<Checkbox
									{...props}
									bind:checked={($formData as Infer<UserSchema>).agree_notification} disabled={userInfoFor === UserInfoFor.INFO_VIEW} />
							<div class="space-y-1 leading-none">
								<Form.Label>{m['USER_INFO.AGREE_NOTIFICATION.TITLE']()}</Form.Label>
							</div>
							<input
								name={props.name}
								value={($formData as Infer<UserSchema>).agree_notification}
								hidden />
						{/snippet}
					</Form.Control>
				</div>
				<Form.Description>
					{m['USER_INFO.AGREE_NOTIFICATION.DESCRIPTION']()}
				</Form.Description>
				<Form.FieldErrors />
			</Form.Field>
		{/if}
		<div class="my-4 space-y-4 border-2 p-4">
			{#if userInfoFor === UserInfoFor.REGISTRATION}
				<Form.Field {form} name="agree_eula">
					<div class="flex flex-row items-center space-y-0 space-x-3">
						<Form.Control>
							{#snippet children({ props })}
								<!-- prettier-ignore -->
								<Checkbox {...props} bind:checked={($formData as Infer<FormSchema>).agree_eula} />
								<div class="space-y-1 leading-none">
									<Form.Label>
										<Badge variant="destructive">{m['FORM.REQUIRED']()}</Badge>
										{m['USER_INFO.AGREE_EULA']()}
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
				<Form.Field {form} name="agree_privacypolicy">
					<div class="flex flex-row items-center space-y-0 space-x-3">
						<Form.Control>
							{#snippet children({ props })}
								<!-- prettier-ignore -->
								<Checkbox
										{...props}
										bind:checked={($formData as Infer<FormSchema>).agree_privacypolicy} />
								<div class="space-y-1 leading-none">
									<Form.Label>
										<Badge variant="destructive">{m['FORM.REQUIRED']()}</Badge>
										{m['USER_INFO.AGREE_PRIVACY_POLICY']()}
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
			<Form.Field {form} name="agree_marketing">
				<div class="flex flex-row items-center space-y-0 space-x-3">
					<Form.Control>
						{#snippet children({ props })}
							<!-- prettier-ignore -->
							<Checkbox
										{...props}
										bind:checked={($formData as Infer<FormSchema>).agree_marketing} disabled={userInfoFor === UserInfoFor.INFO_VIEW} />
							<div class="space-y-1 leading-none">
								<Form.Label>{m['USER_INFO.AGREE_MARKETING']()}</Form.Label>
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
			<Form.Button>{m['USER_INFO.REGISTER']()}</Form.Button>
		{:else if userInfoFor === UserInfoFor.INFO_VIEW}
			<Button href="/settings/info/auth">{m['USER_INFO.EDIT']()}</Button>
		{:else}
			<Form.Button>{m['FORM.SAVE']()}</Form.Button>
			<Button variant="destructive" onclick={() => (openBeforeDeactivationAlert = true)}>
				{m['USER_INFO.DEACTIVATE']()}
			</Button>
		{/if}
	</form>
</Section>

{#snippet WarningBeforeDeactivation()}
	{#snippet destructive(token: string)}
		<span class="text-primary font-bold">{token}</span>
	{/snippet}
	{#snippet exclamation(token: string)}
		<span class="text-foreground font-bold">{token}</span>
	{/snippet}
	{#snippet complex(token: string)}
		{@render replace.format(token, destructive, '\u0003')}
	{/snippet}
	{#snippet message(msg: string)}
		{@render replace.format(msg, exclamation, '\u0002', complex)}
	{/snippet}
	<Ul>
		<li>
			{@render message(m['USER_INFO.BEFORE_DEACTIVATION.WARNING_KEEPING_ARTICLES']())}
		</li>
		<li>
			{@render message(m['USER_INFO.BEFORE_DEACTIVATION.WARNING_AUTO_REFUND']())}
		</li>
		<li>
			{@render message(m['USER_INFO.BEFORE_DEACTIVATION.WARNING_AUTO_SETTLE_UP']())}
		</li>
		<li>
			{@render message(m['USER_INFO.BEFORE_DEACTIVATION.WARNING_REMAIN_POINTS']())}
		</li>
		<li>
			{@render message(m['USER_INFO.BEFORE_DEACTIVATION.WARNING_IRREVERSABLE']())}
		</li>
	</Ul>
	<P>{m['USER_INFO.BEFORE_DEACTIVATION.ARE_YOU_SURE']()}</P>
{/snippet}

<AlertDialog
	title={m['ERROR_ALERT.TITLE']({ while: title })}
	description={m['ERROR_ALERT.DESCRIPTION']()}
	bind:open={openErrorAlert} />
<AlertDialog
	title={m['USER_INFO.BEFORE_DEACTIVATION.TITLE']()}
	description={WarningBeforeDeactivation}
	cancel={true}
	onAction={onDeactivation}
	bind:open={openBeforeDeactivationAlert} />
<AlertDialog
	title={m['USER_INFO.AFTER_DEACTIVATION.TITLE']()}
	description={m['USER_INFO.AFTER_DEACTIVATION.DESCRIPTION']()}
	onAction={() => {
		window.location.href = '/';
	}}
	bind:open={openAfterDeactivationAlert} />
<AlertDialog
	title={m['ERROR_ALERT.TITLE']({ while: m['USER_INFO.WHILE.DEACTIVATION']() })}
	description={m['ERROR_ALERT.DESCRIPTION']()}
	bind:open={openErrorOnDeactivationAlert} />
<AlertDialog
	title={m['USER_INFO.AFTER_AUTHENTICATION.TITLE']()}
	description={m['USER_INFO.AFTER_AUTHENTICATION.DESCRIPTION']()}
	bind:open={openAuthenticationCompletedAlert} />
<AlertDialog
	title={m['ERROR_ALERT.TITLE']({ while: m['USER_INFO.AUTHENTICATION.TITLE']() })}
	description={m['ERROR_ALERT.DESCRIPTION']()}
	bind:open={openErrorOnAuthenticateAlert} />

<!-- XXX (여기부터) 1차 알파테스트 전용 -->
<Dialog.Root bind:open={openAuthenticationDialog}>
	<Dialog.Content
		class="max-h-[100vh] overflow-x-hidden overflow-y-auto transition-none sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>임시 본인 인증: 생년월일 입력</Dialog.Title>
			<Dialog.Description>
				뭐하지공방이 본인 인증 서비스에 가입하기 전까지 생년월일을 기입하는 것으로 대신합니다.
				<br />
				<span class="text-destructive font-bold">한 번 생년월일을 저장하면 변경할 수 없으며,</span>
				잘못 기입한 경우 고객센터에 문의하시어 정정하시기 바랍니다.
			</Dialog.Description>
		</Dialog.Header>
		<div class="flex justify-center">
			<CalendarWithSelects
				type="single"
				maxValue={today(getLocalTimeZone())}
				locale="ko-KR"
				unselectable="off"
				disabled={!!auth?.birthday}
				bind:value={
					() => fromDate(auth?.birthday ?? birthday, getLocalTimeZone()),
					(v) => (birthday = v?.toDate() ?? new Date())
				} />
		</div>
		<section class="text-right">
			<Button onclick={onAuthenticate}>인증하기</Button>
			<Button variant="secondary" onclick={() => (openAuthenticationDialog = false)}>
				{m['FORM.CANCEL']()}
			</Button>
		</section>
	</Dialog.Content>
</Dialog.Root>
<!-- XXX (여기까지) 1차 알파테스트 전용 -->
