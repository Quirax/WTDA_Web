<script lang="ts">
	import { userStore } from '$lib/context';
	import UserAvatar from '$stories/components/Avatar.svelte';
	import { cn, twemoji } from '$lib/utils';
	import type { DMChannel } from '$lib/server/db/schema';
	import { invalidate } from '$app/navigation';
	import { User } from 'lucide-svelte';
	import { source } from 'sveltekit-sse';
	import { page } from '$app/state';
	import SidebarLayout from '$stories/components/SidebarLayout.svelte';
	import { m } from '$lib/messages';

	interface Props extends ReturnType<typeof $props> {
		channels: (DMChannel & { participants?: App.User[]; latestMessage?: App.DM; read: boolean })[];
	}

	const { children, channels }: Props = $props();

	let user = $state<App.User>(null);
	userStore.subscribe((v) => (user = v));

	const onMessage = (message: string) => {
		if (!message) return;
		invalidate('dm:channels');
	};

	source('/sse').select('join').subscribe(onMessage);

	source('/sse').select('leave').subscribe(onMessage);

	source('/sse').select('dmSent').subscribe(onMessage);

	source('/sse').select('dmRead').subscribe(onMessage);
</script>

<SidebarLayout containerClass={(!page.params.id && 'md:h-[90vh]') || 'h-[90vh]'}>
	{#snippet nav()}
		{#each channels as ch}
			{@const participants = (ch.participants || []).filter((v) => v!.id !== user!.id)}
			<a
				href="/dm/{ch.id}"
				class={cn(
					'm-2 flex items-center space-x-2 border p-2',
					(page.params.id === ch.id && 'bg-primary/60 text-primary-foreground') ||
						'hover:bg-accent hover:text-accent-foreground',
					!ch.read && 'border-primary border-2 font-bold',
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
							: m['DM.NO_OTHER_PARTICIPANT']()}
					</strong>
					<span
						class="text-muted-foreground w-full overflow-hidden text-sm text-ellipsis whitespace-nowrap"
						use:twemoji>
						{#if ch.latestMessage!.type === 'general'}
							{ch.latestMessage!.sender!.id === user!.id
								? m['DM.ME']()
								: ch.latestMessage!.sender!.username}: {ch.latestMessage!.message}
						{:else if ch.latestMessage!.type === 'join'}
							<i>{m['DM.MESSAGE.JOIN']({ username: ch.latestMessage!.sender?.username || '' })}</i>
						{:else if ch.latestMessage!.type === 'leave'}
							<i>{m['DM.MESSAGE.LEAVE']({ username: ch.latestMessage!.sender?.username || '' })}</i>
						{/if}
					</span>
				</div>
			</a>
		{/each}
	{/snippet}
	{#snippet content()}
		{@render children()}
	{/snippet}
</SidebarLayout>
