<script lang="ts">
	import { userStore } from '$lib/context';
	import UserAvatar from '$stories/components/Avatar.svelte';
	import { cn } from '$lib/utils';
	import type { DMChannel } from '$lib/server/db/schema';
	import { twemoji } from 'twemoji-svelte-action';
	import { beforeNavigate, invalidateAll } from '$app/navigation';
	import { User } from 'lucide-svelte';
	import { source } from 'sveltekit-sse';
	import { page } from '$app/state';
	import { tick } from 'svelte';

	interface Props extends ReturnType<typeof $props> {
		channels: (DMChannel & { participants?: App.User[]; latestMessage?: App.DM })[];
	}

	const { children, channels }: Props = $props();

	const id = page.params.id;

	let user = $state<App.User>(null);
	userStore.subscribe((v) => (user = v));

	source('/sse')
		.select('dmSent')
		.subscribe((message) => {
			if (!message) return;
			const parsed = JSON.parse(message);

			const channel = channels.find((ch) => ch.id === parsed.channelId);
			if (!channel) return;

			invalidateAll();
		});

	source('/sse')
		.select('join')
		.subscribe((message) => {
			if (!message) return;
			console.log(message);
			invalidateAll();
		});

	source('/sse')
		.select('leave')
		.subscribe((message) => {
			if (!message) return;
			console.log(message);
			invalidateAll();
		});
</script>

<div class={cn('w-ful flex max-md:flex-col', (!id && 'md:h-[90vh]') || 'h-[90vh]')}>
	<nav
		class={cn(
			'bg-background mt-16 w-70 flex-none overflow-y-auto max-md:w-full',
			!!id && 'max-md:hidden',
		)}>
		{#each channels as ch}
			{@const participants = (ch.participants || []).filter((v) => v!.id !== user!.id)}
			<a
				href="/dm/{ch.id}"
				class={cn(
					'm-2 flex items-center space-x-2 border p-2',
					(id === ch.id && 'bg-primary/60 text-primary-foreground') ||
						'hover:bg-accent hover:text-accent-foreground',
				)}>
				<div class="flex -space-x-5">
					{#if participants && participants.length > 0}
						{#each participants as participant}
							<UserAvatar class="size-9" user={participant} withoutLink />
						{/each}
					{:else}
						<User class="size-9" />
					{/if}
				</div>
				<div class="flex flex-col overflow-hidden">
					<strong>
						{participants && participants.length > 0
							? participants.map((v) => v!.username).join(', ')
							: '다른 참여자 없음'}
					</strong>
					<span
						class="text-muted-foreground w-full overflow-hidden text-sm text-ellipsis whitespace-nowrap"
						use:twemoji>
						{#if ch.latestMessage!.type === 'general'}
							{ch.latestMessage!.sender!.id === user!.id
								? '나'
								: ch.latestMessage!.sender!.username}: {ch.latestMessage!.message}
						{:else if ch.latestMessage!.type === 'join'}
							<i>{ch.latestMessage!.sender?.username} 님이 대화방에 들어왔습니다.</i>
						{:else if ch.latestMessage!.type === 'leave'}
							<i>{ch.latestMessage!.sender?.username} 님이 대화방에서 나갔습니다.</i>
						{/if}
					</span>
				</div>
			</a>
		{/each}
	</nav>

	<div class="size-full">
		{@render children()}
	</div>
</div>
