<svelte:options runes />

<script lang="ts">
	import H2 from '$lib/components/typo/h2.svelte';
	import Ul from '$lib/components/typo/ul.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Form from '$lib/components/ui/form';
	import Input from '$lib/components/ui/input/input.svelte';
	import { m } from '$lib/messages';
	import { formSchema, type FormSchema } from '$lib/schema/login';
	import { replace } from '$lib/utils.svelte';
	import AlertDialog from '$stories/components/AlertDialog.svelte';
	import Header from '$stories/components/Header.svelte';
	import Section from '$stories/components/Section.svelte';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	interface Props {
		data: SuperValidated<Infer<FormSchema>>;
	}

	const {
		data = {
			id: '',
			valid: false,
			posted: false,
			errors: { _errors: undefined },
			data: {
				email: '',
				password: '',
			},
		},
	}: Props = $props();

	let openUserNotFoundAlert = $state(false);
	let openOtherErrorAlert = $state(false);

	const form = superForm(data, {
		validators: zodClient(formSchema),
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
		<li>{m['USER_INFO.USER_NOT_FOUND.DESCRIPTION_CHECK_EMAIL']()}</li>
		<li>{@render replace.link(m['USER_INFO.USER_NOT_FOUND.DESCRIPTION_REGISTER']())}</li>
		<li>{@render replace.link(m['USER_INFO.USER_NOT_FOUND.DESCRIPTION_RESET_PASSWORD']())}</li>
	</Ul>
{/snippet}

<Header title={m['LOGIN']()} />

<Section>
	<H2>{m['LOGIN']()}</H2>
	<form method="POST" use:enhance class="w-full sm:w-2/3" action="?">
		<Form.Field {form} name="email" class="my-4 flex flex-col space-y-1">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>{m['USER_INFO.EMAIL']()}</Form.Label>
					<Input {...props} bind:value={$formData.email} {...$constraints.email} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Field {form} name="password" class="mb-4 flex flex-col space-y-1">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>{m['USER_INFO.PASSWORD']()}</Form.Label>
					<Input
						{...props}
						type="password"
						bind:value={$formData.password}
						{...$constraints.password} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Button>{m['LOGIN']()}</Form.Button>
		<Button href="/login/reset-password">{m['USER_INFO.RESET_PASSWORD.TITLE']()}</Button>
	</form>
</Section>

<AlertDialog
	title={m['USER_INFO.USER_NOT_FOUND.INVALID']()}
	description={userNotFoundDesc}
	bind:open={openUserNotFoundAlert} />
<AlertDialog
	title={m['ERROR_ALERT.TITLE']({ while: m['LOGIN']() })}
	description={m['ERROR_ALERT.DESCRIPTION']()}
	bind:open={openOtherErrorAlert} />
