<script lang="ts">
	import PasswordAuth from '$stories/login/PasswordAuth.svelte';
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();
</script>

<PasswordAuth data={data.form} />
