<svelte:options runes />

<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import EmailConfirm from '../../../stories/register/EmailConfirm.svelte';
	import type { HTMLSlotAttributes } from 'svelte/elements';
	import { EmailConfirmFor } from '../../../app';

	interface Props extends HTMLSlotAttributes {
		data: PageData;
		result: ActionData;
	}

	const { data, result }: Props = $props();
</script>

<EmailConfirm data={data.form} {result} confirmFor={EmailConfirmFor.REGISTRATION} />
