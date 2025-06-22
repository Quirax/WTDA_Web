<svelte:options runes />

<script lang="ts">
	import type { HTMLSlotAttributes } from 'svelte/elements';
	import * as Avatar from '$lib/components/ui/avatar';
	import User from 'lucide-svelte/icons/user';

	interface Props extends HTMLSlotAttributes {
		user: Pick<NonNullable<App.User>, 'id' | 'profileImage' | 'username'> | null;
	}

	const {
		class: className = undefined,
		user = {
			id: '',
			username: '',
			profileImage: null,
		},
	}: Props = $props();
</script>

<a href="/user/{user?.id}">
	<Avatar.Root class={className}>
		<Avatar.Image src={user?.profileImage} alt={user?.username} />
		<Avatar.Fallback><User /></Avatar.Fallback>
	</Avatar.Root>
</a>
