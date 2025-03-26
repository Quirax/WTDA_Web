<script lang="ts">
	import UserInfo, { UserInfoFor } from '$stories/user/info/UserInfo.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<UserInfo data={data.form} for={UserInfoFor.INFO_EDIT} />
