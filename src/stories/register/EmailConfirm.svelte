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

	interface Props {
		data: SuperValidated<Infer<FormSchema>>;
		result?: ActionData;
		confirmFor: EmailConfirmFor;
	}

	const {
		data = {
			id: '',
			valid: false,
			posted: false,
			errors: { _errors: undefined },
			data: {
				email: '',
				confirmCode: '',
			},
		},
		result = {
			message: '',
			result: {
				envelope: {
					from: '',
					to: [],
				},
				messageId: '',
				accepted: [],
				rejected: [],
				response: '',
				envelopeTime: 0,
				messageTime: 0,
				messageSize: 0,
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
				alertData = {
					title: '이메일 인증 처리 도중 오류가 발생했습니다.',
					description: '고객센터에 문의해주시기 바랍니다.',
				};
				openAlert = true;
				cancel();
			}
		},
	});
	const { form: formData, enhance, constraints } = form;
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
		<form method="POST" class="w-2/3" action="?/do">
			<div class="my-4 flex flex-col space-y-1">
				<div class="text-sm leading-none font-medium">
					아래 버튼을 클릭하여 인증 메일을 보낸 뒤, 메일에 기재된 인증 코드를 입력해주세요.
				</div>
			</div>
			<Button formaction="?/send">인증메일 보내기</Button>
			<Form.Field {form} name="confirmCode" class="my-4 flex flex-col space-y-1">
				<Form.Control let:attrs>
					<Form.Label>인증 코드</Form.Label>
					<Input
						{...attrs}
						placeholder="XXXXX-XXXXX"
						bind:value={$formData.confirmCode}
						{...$constraints.confirmCode} />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Button>인증완료</Form.Button>
		</form>
	</Section>
</Layout>
