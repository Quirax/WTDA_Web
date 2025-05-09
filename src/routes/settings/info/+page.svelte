<script lang="ts">
	import UserInfo, { UserInfoFor } from '$stories/settings/info/UserInfo.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<UserInfo data={data.form} for={UserInfoFor.INFO_VIEW} auth={data.auth} />
