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
					title: '이메일 인증',
					heading: '거의 다 되었습니다!',
					desc: '다른 악의적 사용자에 의해 이메일이 도용되었을 경우를 대비하여 최종적으로 이메일 인증을 진행합니다.',
				};
			}
			case EmailConfirmFor.RESET_PASSWORD: {
				return {
					title: '비밀번호 재설정',
					heading: '비밀번호 재설정',
					desc: '다른 악의적 사용자에 의해 비밀번호가 재설정되지 않도록 이메일 인증을 진행합니다.',
				};
			}
		}
	};

	let descriptions = $derived(setDescriptions());

	let openOtherErrorAlert = $state(false);

	const form = superForm(data, {
		validators: zodClient(formSchema),
		onResult({ result, cancel }) {
			if ([200, 204, 302].indexOf(result.status || 0) === -1) {
				openOtherErrorAlert = true;
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

	let openUserNotFoundAlert = $state(false);
	let openSendErrorAlert = $state(false);

	const onSend = async () => {
		const formData = new FormData();

		expiresIn = -1;

		if (confirmFor === EmailConfirmFor.RESET_PASSWORD) {
			formData.append('email', email);
		}

		const result = await fetch('?/send', {
			method: 'post',
			body: formData,
		}).then((r) => r.json());

		if ([200, 204, 302].indexOf(result.status || 0) === -1) {
			if (result.status === 404) openUserNotFoundAlert = true;
			else openSendErrorAlert = true;
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
		<li>회원가입 시 사용한 이메일이 맞는지 다시 확인하시기 바랍니다.</li>
		<li>
			회원가입을 하지 않으셨다면 <Button variant="link" href="/register">회원가입</Button>을 하시기
			바랍니다.
		</li>
	</Ul>
{/snippet}

<Header title={descriptions.title} showSearchPanel={false} showUserPanel={false} />

<Section>
	<H2>{descriptions.heading}</H2>
	<P>{descriptions.desc}</P>
	<form method="POST" class="w-full sm:w-2/3" action="?/do" use:enhance>
		{#if confirmFor === EmailConfirmFor.RESET_PASSWORD}
			<Form.Field {form} name="email" class="flex flex-col my-4 space-y-1">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>비밀번호를 재설정할 이메일 주소</Form.Label>
						<Input
							{...props}
							placeholder="이메일 주소"
							bind:value={email}
							{...$constraints.email}
							required />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
		{/if}
		<div class="flex flex-col my-4 space-y-1">
			<div class="text-sm font-medium leading-none">
				아래 버튼을 클릭하여 인증 메일을 보낸 뒤, 메일에 기재된 인증 코드를 입력해주세요.
			</div>
		</div>
		<Button onclick={onSend} disabled={expiresIn === -1}>인증메일 보내기</Button>
		<Form.Field {form} name="confirmCode" class="flex flex-col my-4 space-y-1">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>
						인증 코드{expiresIn > 0
							? ` (${Math.floor(expiresIn / 60)}:${String(expiresIn % 60).padStart(2, '0')} 후 만료)`
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
		<Form.Button type="submit" disabled={expiresIn <= 0}>인증완료</Form.Button>
	</form>
</Section>

<AlertDialog
	title="해당 이메일을 사용하는 사용자가 없습니다."
	description={userNotFoundDesc}
	bind:open={openUserNotFoundAlert} />
<AlertDialog
	title="이메일 인증 처리 도중 오류가 발생했습니다."
	description="고객센터에 문의해주시기 바랍니다."
	bind:open={openOtherErrorAlert} />
<AlertDialog
	title="인증메일을 보내는 도중 오류가 발생했습니다."
	description="고객센터에 문의해주시기 바랍니다."
	bind:open={openSendErrorAlert} />
