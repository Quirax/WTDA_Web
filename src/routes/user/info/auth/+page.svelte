<script lang="ts">
	import UserInfoAuth from '$stories/user/info/UserInfoAuth.svelte';
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();
</script>

<UserInfoAuth data={data.form} />
