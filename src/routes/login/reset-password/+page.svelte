<svelte:options runes />

<script lang="ts">
	import EmailConfirm from '$stories/register/EmailConfirm.svelte';
	import { EmailConfirmFor } from '../../../app';
	import type { PageData } from './$types';

	interface Props extends ReturnType<typeof $props> {
		data: PageData;
	}

	const { data }: Props = $props();
</script>

<EmailConfirm data={data.form} confirmFor={EmailConfirmFor.RESET_PASSWORD} />
