<svelte:options runes />

<script lang="ts">
	import Section from '../components/Section.svelte';
	import H2 from '$lib/components/typo/h2.svelte';
	import * as Form from '$lib/components/ui/form';
	import Input from '$lib/components/ui/input/input.svelte';
	import P from '$lib/components/typo/p.svelte';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { formSchema, type FormSchema } from '$lib/schema/emailConfirm';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { Button } from '$lib/components/ui/button';
	import { EmailConfirmFor } from '@app';
	import { emailExpiresIn } from '$lib/config';
	import Ul from '$lib/components/typo/ul.svelte';
	import Header from '$stories/components/Header.svelte';
	import AlertDialog from '$stories/components/AlertDialog.svelte';
	import { toast } from 'svelte-sonner';
	import { m } from '$lib/messages';
	import { replace } from '$lib/utils.svelte';

	interface Props {
		data: SuperValidated<Infer<FormSchema>>;
		confirmFor: EmailConfirmFor;
	}

	const {
		data = {
			id: '',
			valid: false,
			posted: false,
			errors: { _errors: undefined },
			data: {
				confirmCode: '',
			},
		},
		confirmFor,
	}: Props = $props();

	const setDescriptions: () => { title: string; heading: string; desc: string } = () => {
		switch (confirmFor) {
			case EmailConfirmFor.REGISTRATION: {
				return {
					title: m['USER_INFO.EMAIL_CONFIRM.TITLE'](),
					heading: m['USER_INFO.EMAIL_CONFIRM.HEADING'](),
					desc: m['USER_INFO.EMAIL_CONFIRM.DESCRIPTION'](),
				};
			}
			case EmailConfirmFor.RESET_PASSWORD: {
				return {
					title: m['USER_INFO.RESET_PASSWORD.TITLE'](),
					heading: m['USER_INFO.RESET_PASSWORD.HEADING'](),
					desc: m['USER_INFO.RESET_PASSWORD.DESCRIPTION'](),
				};
			}
		}
	};

	let descriptions = $derived(setDescriptions());

	const form = superForm(data, {
		validators: zodClient(formSchema),
		onResult({ result, cancel }) {
			if ([200, 204, 302].indexOf(result.status || 0) === -1) {
				toast.error(m['ERROR_ALERT.TITLE']({ while: m['USER_INFO.EMAIL_CONFIRM.TITLE']() }), {
					description: m['ERROR_ALERT.DESCRIPTION'](),
				});
				cancel();
			}
		},
	});

	const { form: formData, enhance, constraints, reset: resetForm } = form;

	let expiresIn = $state(0); // seconds
	let expireTimer: ReturnType<typeof setInterval> = null!;

	const resetTimer = () => {
		resetForm();
		clearInterval(expireTimer);
	};

	let email = $state('');
	let invitationCode = $state(''); // XXX 알파테스트 전용

	let openUserNotFoundAlert = $state(false);

	const onSend = async () => {
		const formData = new FormData();

		expiresIn = -1;

		if (confirmFor === EmailConfirmFor.RESET_PASSWORD) {
			formData.append('email', email);
			// XXX (여기부터) 알파테스트 전용
		} else if (confirmFor === EmailConfirmFor.REGISTRATION) {
			// 1차 알파테스트: 가입 시 확인 이메일 전송 요청 시 초대코드도 전달
			formData.append('invitation_code', invitationCode);
			// XXX (여기까지) 알파테스트 전용
		}

		const result = await fetch('?/send', {
			method: 'post',
			body: formData,
		}).then((r) => r.json());

		if ([200, 204, 302].indexOf(result.status || 0) === -1) {
			if (result.status === 404) {
				// XXX (여기부터) 알파테스트 전용
				if (confirmFor === EmailConfirmFor.REGISTRATION) {
					toast.error('초대코드가 잘못되었습니다.', {
						description: '다시 확인하시거나 관리자에게 문의하시기 바랍니다.',
					});
				} else
					// XXX (여기까지) 알파테스트 전용
					openUserNotFoundAlert = true;
			} else
				toast.error(m['ERROR_ALERT.TITLE']({ while: m['USER_INFO.WHILE.SENDING_EMAIL']() }), {
					description: m['ERROR_ALERT.DESCRIPTION'](),
				});
			expiresIn = 0;
			return;
		}

		expiresIn = emailExpiresIn;

		resetTimer();

		expireTimer = setInterval(() => {
			if (--expiresIn === 0) resetTimer();
		}, 1000);
	};
</script>

{#snippet userNotFoundDesc()}
	<Ul>
		<li>{m['USER_INFO.USER_NOT_FOUND.DESCRIPTION_CHECK_EMAIL']()}</li>
		<li>{@render replace.link(m['USER_INFO.USER_NOT_FOUND.DESCRIPTION_REGISTER']())}</li>
	</Ul>
{/snippet}

<Header title={descriptions.title} showSearchPanel={false} showUserPanel={false} />

<Section>
	<H2>{descriptions.heading}</H2>
	<P>{descriptions.desc}</P>
	<form method="POST" class="w-full lg:w-2/3" action="?/do" use:enhance>
		{#if confirmFor === EmailConfirmFor.RESET_PASSWORD}
			<Form.Field {form} name="email" class="my-4 flex flex-col space-y-1">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>{m['USER_INFO.EMAIL_TO_RESET_PASSWORD']()}</Form.Label>
						<Input
							{...props}
							placeholder={m['USER_INFO.EMAIL']()}
							bind:value={email}
							{...$constraints.email}
							disabled={expiresIn > 0 || expiresIn === -1}
							required />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<!-- XXX: (여기부터) 알파테스트 전용 -->
		{:else if confirmFor === EmailConfirmFor.REGISTRATION}
			<!-- 1차 알파테스트: 초대코드 입력란 추가 -->
			<Form.Field {form} name="invitationCode" class="my-4 flex flex-col space-y-1">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>초대코드</Form.Label>
						<Input
							{...props}
							placeholder="초대코드"
							bind:value={invitationCode}
							{...$constraints.invitationCode}
							disabled={expiresIn > 0 || expiresIn === -1}
							required />
					{/snippet}
				</Form.Control>
				<Form.Description>
					알파테스트 기간 중에는 관리자로부터 초대코드를 발급받아야 합니다. 아직 발급받지 않은 경우
					관리자에게 문의하시기 바랍니다.
				</Form.Description>
				<Form.FieldErrors />
			</Form.Field>
			<!-- XXX: (여기까지) 알파테스트 전용 -->
		{/if}
		<div class="my-4 flex flex-col space-y-1">
			<div class="text-sm leading-none font-medium">
				{m['USER_INFO.EMAIL_CONFIRM_INSTRUCTION']()}
			</div>
		</div>
		<Button onclick={onSend} disabled={expiresIn === -1}>
			{m['USER_INFO.SEND_CONFIRM_EMAIL']()}
		</Button>
		<Form.Field {form} name="confirmCode" class="my-4 flex flex-col space-y-1">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>
						{m['USER_INFO.CONFIRM_CODE']()}{expiresIn > 0
							? ` (${m['USER_INFO.EXPIRES_IN']({ minutes: Math.floor(expiresIn / 60), seconds: String(expiresIn % 60).padStart(2, '0') })})`
							: ''}
					</Form.Label>
					<Input
						{...props}
						placeholder="XXXXX-XXXXX"
						bind:value={$formData.confirmCode}
						disabled={expiresIn <= 0}
						{...$constraints.confirmCode} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Button type="submit" disabled={expiresIn <= 0}>
			{m['USER_INFO.COMPLETE_EMAIL_CONFIRM']()}
		</Form.Button>
	</form>
</Section>

<AlertDialog
	title={m['USER_INFO.USER_NOT_FOUND.TITLE']()}
	description={userNotFoundDesc}
	bind:open={openUserNotFoundAlert} />
