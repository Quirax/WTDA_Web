<script lang="ts">
	import UserInfoAuth from '$stories/settings/info/UserInfoAuth.svelte';
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();
</script>

<UserInfoAuth data={data.form} />
