<script lang="ts">
	import ResetPassword from '$stories/login/ResetPassword.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<ResetPassword data={data.form} />
