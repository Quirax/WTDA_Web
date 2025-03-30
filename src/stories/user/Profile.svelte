<svelte:options runes />

<script lang="ts">
	import Header from '$stories/components/Header.svelte';

	interface Props extends ReturnType<typeof $props> {
		user: Omit<NonNullable<App.User>, 'id' | 'status'> | null;
	}

	const { user }: Props = $props();
</script>

<Header title={user?.username} />
