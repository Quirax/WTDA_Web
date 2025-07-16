<svelte:options runes />

<script lang="ts">
	import type { HTMLSlotAttributes } from 'svelte/elements';
	import * as Avatar from '$lib/components/ui/avatar';
	import User from 'lucide-svelte/icons/user';

	interface Props extends HTMLSlotAttributes {
		user: Pick<NonNullable<App.User>, 'id' | 'profileImage' | 'username'> | null;
		withoutLink?: boolean;
	}

	const {
		class: className = undefined,
		user = {
			id: '',
			username: '',
			profileImage: null,
		},
		withoutLink = false,
	}: Props = $props();
</script>

{#snippet content()}
	<Avatar.Root class={className}>
		<Avatar.Image src={user?.profileImage} alt={user?.username} />
		<Avatar.Fallback><User class="text-secondary-foreground" /></Avatar.Fallback>
	</Avatar.Root>
{/snippet}

{#if withoutLink}
	{@render content()}
{:else}
	<a href="/user/{user?.id}">
		{@render content()}
	</a>
{/if}
