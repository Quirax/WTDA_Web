<script lang="ts">
	import { sessionContext, userContext } from '$lib/context';
	import UserInfo, { UserInfoFor } from '$stories/user/info/UserInfo.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	userContext.v = data.user;
	sessionContext.v = data.session;
</script>

<UserInfo data={data.form} for={UserInfoFor.INFO_VIEW} />
