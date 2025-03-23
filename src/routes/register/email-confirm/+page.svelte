<svelte:options runes />

<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import EmailConfirm from '../../../stories/register/EmailConfirm.svelte';
	import type { HTMLSlotAttributes } from 'svelte/elements';
	import { EmailConfirmFor } from '../../../app';

	interface Props extends HTMLSlotAttributes {
		data: PageData;
	}

	const { data }: Props = $props();
</script>

<EmailConfirm data={data.form} confirmFor={EmailConfirmFor.REGISTRATION} />
