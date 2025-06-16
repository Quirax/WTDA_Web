<script lang="ts">
	import { userStore } from '$lib/context';
	import UserAvatar from '$stories/components/Avatar.svelte';
	import { cn } from '$lib/utils';
	import type { DMChannel } from '$lib/server/db/schema';

	interface Props extends ReturnType<typeof $props> {
		id?: string;
		channels: DMChannel[];
	}

	const { children, id, channels }: Props = $props();

	let user = $state<App.User>(null);
	userStore.subscribe((v) => (user = v));
</script>

<div class={cn('w-ful flex max-md:flex-col', (!id && 'md:h-[90vh]') || 'h-[90vh]')}>
	<nav
		class={cn(
			'bg-background mt-16 w-70 flex-none overflow-y-auto max-md:w-full',
			!!id && 'max-md:hidden',
		)}>
		{#each channels as ch}
			<a
				href="/dm/{ch.id}"
				class={cn(
					'm-2 flex items-center space-x-2 border p-2',
					(id === ch.id && 'bg-primary/60 text-primary-foreground') ||
						'hover:bg-accent hover:text-accent-foreground',
				)}>
				<!-- TODO: 참가자 목록과 마지막 메시지 가져오기 -->
				<UserAvatar class="size-9" {user} />
				<div class="flex flex-col">
					<strong>{user?.username}</strong>
					<span
						class="text-muted-foreground w-47 overflow-hidden text-sm text-ellipsis whitespace-nowrap">
						고양이 고양이 고양이 고양이 고양이 고양이
					</span>
				</div>
				<!-- 여기까지 -->
			</a>
		{/each}
	</nav>

	<div class="size-full">
		{@render children()}
	</div>
</div>
