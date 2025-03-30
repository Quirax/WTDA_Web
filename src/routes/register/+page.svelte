<svelte:options runes />

<script lang="ts">
	import type { PageData } from './$types';
	import UserInfo, { UserInfoFor } from '../../stories/settings/info/UserInfo.svelte';
	import type { HTMLSlotAttributes } from 'svelte/elements';

	interface Props extends HTMLSlotAttributes {
		data: PageData;
	}

	const { data }: Props = $props();
</script>

<UserInfo data={data.form} for={UserInfoFor.REGISTRATION} />
