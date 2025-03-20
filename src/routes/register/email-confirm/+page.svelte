<svelte:options runes />

<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import EmailConfirm from '../../../stories/register/EmailConfirm.svelte';
	import type { HTMLSlotAttributes } from 'svelte/elements';

	interface Props extends HTMLSlotAttributes {
		data: PageData;
		form: ActionData;
	}

	const { data, form }: Props = $props();

	$effect(() => {
		console.log(form);
	});
</script>

<!-- <EmailConfirm data={data.form} /> -->
<EmailConfirm />
