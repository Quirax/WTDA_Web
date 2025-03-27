<svelte:options runes />

<script lang="ts">
	import H2 from '$lib/components/typo/h2.svelte';
	import P from '$lib/components/typo/p.svelte';
	import { passwordSchema, type PasswordSchema } from '$lib/schema/userInfo';
	import Section from '$stories/components/Section.svelte';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import * as Form from '$lib/components/ui/form';
	import Input from '$lib/components/ui/input/input.svelte';
	import { Button } from '$lib/components/ui/button';
	import Ul from '$lib/components/typo/ul.svelte';
	import Header from '$stories/components/Header.svelte';
	import AlertDialog from '$stories/components/AlertDialog.svelte';

	interface Props {
		data: SuperValidated<Infer<PasswordSchema>>;
	}

	const { data }: Props = $props();

	let openUserNotFoundAlert = $state(false);
	let openOtherErrorAlert = $state(false);

	const form = superForm(data, {
		validators: zodClient(passwordSchema),
		onResult({ result, cancel }) {
			if ([200, 204, 302].indexOf(result.status || 0) === -1) {
				if (result.status === 404) openUserNotFoundAlert = true;
				else openOtherErrorAlert = true;

				cancel();
			}
		},
	});
	const { form: formData, enhance, constraints } = form;
</script>

{#snippet userNotFoundDesc()}
	<Ul>
		<li>비밀번호가 맞는지 다시 확인하시기 바랍니다.</li>
		<li>
			비밀번호를 잊어버렸다면 <Button variant="link" href="/logout">로그아웃</Button> 후 비밀번호를 재설정하시기
			바랍니다.
		</li>
	</Ul>
{/snippet}

<Header title="사용자 정보 변경" />

<Section>
	<H2>비밀번호 확인</H2>
	<P>본인확인을 위해 비밀번호를 입력하십시오</P>
	<form method="POST" use:enhance class="w-2/3" action="?">
		<Form.Field {form} name="password" class="flex flex-col mt-4 space-y-1">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>비밀번호</Form.Label>
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
		<Form.Button>확인</Form.Button>
	</form>
</Section>

<AlertDialog
	title="입력하신 비밀번호가 틀렸습니다."
	description={userNotFoundDesc}
	bind:open={openUserNotFoundAlert} />
<AlertDialog
	title="비밀번호 확인 도중 오류가 발생했습니다."
	description="고객센터에 문의해주시기 바랍니다."
	bind:open={openOtherErrorAlert} />
