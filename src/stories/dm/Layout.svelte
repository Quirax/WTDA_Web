<script lang="ts">
	import { userStore } from '$lib/context';
	import UserAvatar from '$stories/components/Avatar.svelte';
	import { cn } from '$lib/utils';

	interface Props extends ReturnType<typeof $props> {
		id?: string;
	}

	const { children, id }: Props = $props();

	let user = $state<App.User>(null);

	userStore.subscribe((v) => (user = v));
</script>

<div class="flex h-[90vh] w-full">
	<nav class="bg-background mt-16 w-70 overflow-y-auto">
		{#each Array(20) as a, i}
			<a
				href="/dm/{i}"
				class={cn(
					'm-2 flex items-center space-x-2 border p-2',
					(id === i.toString() && 'bg-primary/60 text-primary-foreground') ||
						'hover:bg-accent hover:text-accent-foreground',
				)}>
				<UserAvatar class="size-9" {user} />
				<div class="flex flex-col">
					<strong>{user?.username}</strong>
					<span
						class="text-muted-foreground w-47 overflow-hidden text-sm text-ellipsis whitespace-nowrap">
						고양이 고양이 고양이 고양이 고양이 고양이
					</span>
				</div>
			</a>
		{/each}
	</nav>

	<div>
		{@render children()}
	</div>
</div>
