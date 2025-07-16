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
	import { replace } from '$lib/utils.svelte';
	import { m } from '$lib/messages';
	import { toast } from 'svelte-sonner';

	interface Props {
		data: SuperValidated<Infer<PasswordSchema>>;
	}

	const { data }: Props = $props();

	let openUserNotFoundAlert = $state(false);

	const form = superForm(data, {
		validators: zodClient(passwordSchema),
		onResult({ result, cancel }) {
			if ([200, 204, 302].indexOf(result.status || 0) === -1) {
				if (result.status === 404) openUserNotFoundAlert = true;
				else
					toast.error(m['ERROR_ALERT.TITLE']({ while: m['USER_INFO.PASSWORD_AUTH.TITLE']() }), {
						description: m['ERROR_ALERT.DESCRIPTION'](),
					});

				cancel();
			}
		},
	});
	const { form: formData, enhance, constraints } = form;
</script>

{#snippet userNotFoundDesc()}
	<Ul>
		<li>{m['USER_INFO.PASSWORD_AUTH.INVALID.DESCRIPTION_CHECK']()}</li>
		<li>
			{@render replace.link(m['USER_INFO.PASSWORD_AUTH.INVALID.DESCRIPTION_RESET_PASSWORD']())}
		</li>
	</Ul>
{/snippet}

<Header title={m['USER_INFO.PASSWORD_AUTH.TITLE']()} />

<Section>
	<H2>{m['USER_INFO.PASSWORD_AUTH.TITLE']()}</H2>
	<P>{m['USER_INFO.PASSWORD_AUTH.DESCRIPTION']()}</P>
	<form method="POST" use:enhance class="w-full lg:w-2/3" action="?">
		<Form.Field {form} name="password" class="mt-4 flex flex-col space-y-1">
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
			<Form.Description>{m['USER_INFO.PASSWORD_MIN_LENGTH']()}</Form.Description>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Button>{m['CONFIRM']()}</Form.Button>
	</form>
</Section>

<AlertDialog
	title={m['USER_INFO.PASSWORD_AUTH.INVALID.TITLE']()}
	description={userNotFoundDesc}
	bind:open={openUserNotFoundAlert} />
