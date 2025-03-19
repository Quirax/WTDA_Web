<svelte:options runes />

<script lang="ts">
	import type { PageData } from './$types';
	import EmailConfirm from '../../../stories/register/EmailConfirm.svelte';
	import type { HTMLSlotAttributes } from 'svelte/elements';

	interface Props extends HTMLSlotAttributes {
		data: PageData;
	}

	const { data }: Props = $props();
</script>

<!-- <EmailConfirm data={data.form} /> -->
<EmailConfirm />
