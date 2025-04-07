<svelte:options runes />

<script lang="ts">
	import type { HTMLSlotAttributes } from 'svelte/elements';
	import * as Avatar from '$lib/components/ui/avatar';
	import User from 'lucide-svelte/icons/user';

	interface Props extends HTMLSlotAttributes {
		user: Pick<NonNullable<App.User>, 'profileImage' | 'username'> | null;
	}

	const {
		class: className = undefined,
		user = {
			username: '',
			profileImage: null,
		},
	}: Props = $props();
</script>

<Avatar.Root class={className}>
	<Avatar.Image src={user?.profileImage} alt={user?.username} />
	<Avatar.Fallback><User /></Avatar.Fallback>
</Avatar.Root>
