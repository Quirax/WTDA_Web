<script lang="ts">
	import Form from '$stories/request/Form.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

{#if data.form}
	<Form data={data.form} editMode />
{/if}
