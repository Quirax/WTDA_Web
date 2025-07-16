<svelte:options runes />

<script lang="ts">
	import H2 from '$lib/components/typo/h2.svelte';
	import { passwordSchema, type PasswordSchema } from '$lib/schema/login';
	import Section from '$stories/components/Section.svelte';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import * as Form from '$lib/components/ui/form';
	import Input from '$lib/components/ui/input/input.svelte';
	import P from '$lib/components/typo/p.svelte';
	import { goto } from '$app/navigation';
	import Header from '$stories/components/Header.svelte';
	import AlertDialog from '$stories/components/AlertDialog.svelte';
	import { m } from '$lib/messages';

	interface Props {
		data: SuperValidated<Infer<PasswordSchema>>;
	}

	const { data }: Props = $props();

	let disableButton = $state(false);

	let openFailedAlert = $state(false);
	let openSucceedAlert = $state(false);

	const form = superForm(data, {
		validators: zodClient(passwordSchema),
		onSubmit() {
			disableButton = true;
		},
		onResult({ result, cancel }) {
			if ([200, 204, 302].indexOf(result.status || 0) === -1) {
				openFailedAlert = true;
				disableButton = false;
				cancel();
			} else {
				openSucceedAlert = true;
			}
		},
	});
	const { form: formData, enhance, constraints } = form;
</script>

<Header
	title={m['USER_INFO.RESET_PASSWORD.TITLE']()}
	showSearchPanel={false}
	showUserPanel={false} />

<Section>
	<H2>{m['USER_INFO.RESET_PASSWORD.TITLE']()}</H2>
	<P>{m['USER_INFO.RESET_PASSWORD.DESCRIPTION_RESET']()}</P>
	<form method="POST" use:enhance class="w-full lg:w-2/3" action="?">
		<Form.Field {form} name="password" class="my-4 flex flex-col space-y-1">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>{m['USER_INFO.RESET_PASSWORD.NEW_PASSWORD']()}</Form.Label>
					<Input
						{...props}
						type="password"
						bind:value={$formData.password}
						{...$constraints.password} />
				{/snippet}
			</Form.Control>
			<Form.Description>{m['USER_INFO.PASSWORD_MIN_LENGTH']()}</Form.Description>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Field {form} name="passwordConfirm" class="mb-4 flex flex-col space-y-1">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>{m['USER_INFO.PASSWORD_CONFIRM']()}</Form.Label>
					<Input
						{...props}
						type="password"
						bind:value={$formData.passwordConfirm}
						{...$constraints.passwordConfirm} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Button disabled={disableButton}>{m['USER_INFO.RESET_PASSWORD.TITLE']()}</Form.Button>
	</form>
</Section>

<AlertDialog
	title={m['ERROR_ALERT.TITLE']({ while: m['USER_INFO.RESET_PASSWORD.TITLE']() })}
	description={m['ERROR_ALERT.DESCRIPTION']()}
	bind:open={openFailedAlert} />
<AlertDialog
	title={m['USER_INFO.RESET_PASSWORD.COMPLETED.TITLE']()}
	description={m['USER_INFO.RESET_PASSWORD.COMPLETED.DESCRIPTION']()}
	onAction={() => {
		goto('/login');
	}}
	bind:open={openSucceedAlert} />
