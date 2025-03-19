<svelte:options runes />

<script lang="ts">
	import type { HTMLSlotAttributes } from 'svelte/elements';
	import { UserStatus } from '../../app';
	import * as Avatar from '$lib/components/ui/avatar';
	import User from 'lucide-svelte/icons/user';

	interface Props extends HTMLSlotAttributes {
		user: App.User;
	}

	const {
		class: className = undefined,
		user = {
			id: '',
			username: '',
			profileImage: null,
			email: '',
			status: UserStatus.REQUIRED_EMAIL_CONFIRM,
		},
	}: Props = $props();
</script>

<Avatar.Root class={className}>
	<Avatar.Image src={user?.profileImage} alt={user?.username} />
	<Avatar.Fallback><User /></Avatar.Fallback>
</Avatar.Root>
