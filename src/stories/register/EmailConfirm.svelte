<svelte:options runes />

<script lang="ts">
	import Section from '../components/Section.svelte';
	import Layout, { type Alert } from '../Layout.svelte';
	import H2 from '$lib/components/typo/h2.svelte';
	import * as Form from '$lib/components/ui/form';
	import Input from '$lib/components/ui/input/input.svelte';
	import P from '$lib/components/typo/p.svelte';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { formSchema, type FormSchema } from '$lib/schema/emailConfirm';
	import type { ActionData } from '../../routes/register/email-confirm/$types';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { Button } from '$lib/components/ui/button';
	import { EmailConfirmFor } from '../../app';
	import { emailExpiresIn } from '$lib/config';

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
					title: '비밀번호 초기화',
					heading: '이메일 인증',
					desc: '다른 악의적 사용자에 의해 비밀번호 초기화가 진행되는 경우를 대비하여 이메일 인증을 진행합니다.',
				};
			}
		}
	};

	let descriptions = $derived(setDescriptions());

	let openAlert = $state(false);
	let alertData = $state<Alert | undefined>(undefined);

	const form = superForm(data, {
		validators: zodClient(formSchema),
		onResult({ result, cancel }) {
			if ([200, 204, 302].indexOf(result.status || 0) === -1) {
				console.log(result.status);
				alertData = {
					title: '이메일 인증 처리 도중 오류가 발생했습니다.',
					description: '고객센터에 문의해주시기 바랍니다.',
				};
				openAlert = true;
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

	const onSend = async () => {
		const formData = new FormData();

		const result = await fetch('?/send', {
			method: 'post',
			body: formData,
		}).then((r) => r.json());

		if ([200, 204, 302].indexOf(result.status || 0) === -1) {
			alertData = {
				title: '인증메일을 보내는 도중 오류가 발생했습니다.',
				description: '고객센터에 문의해주시기 바랍니다.',
			};
			openAlert = true;
			return;
		}

		expiresIn = emailExpiresIn;

		resetTimer();

		expireTimer = setInterval(() => {
			if (--expiresIn === 0) resetTimer();
		}, 1000);
	};
</script>

<Layout
	title={descriptions.title}
	showSearchPanel={false}
	showUserPanel={false}
	bind:openAlert
	alert={alertData}>
	<Section>
		<H2>{descriptions.heading}</H2>
		<P>{descriptions.desc}</P>
		<form method="POST" class="w-2/3" action="?/do" use:enhance>
			<div class="flex flex-col my-4 space-y-1">
				<div class="text-sm font-medium leading-none">
					아래 버튼을 클릭하여 인증 메일을 보낸 뒤, 메일에 기재된 인증 코드를 입력해주세요.
				</div>
			</div>
			<Button onclick={onSend}>인증메일 보내기</Button>
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
							disabled={expiresIn === 0}
							{...$constraints.confirmCode} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Button type="submit" disabled={expiresIn === 0}>인증완료</Form.Button>
		</form>
	</Section>
</Layout>
