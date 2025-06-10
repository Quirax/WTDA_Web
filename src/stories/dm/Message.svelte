<script lang="ts" module>
	export enum Direction {
		RECEIVE = 'RECEIVE',
		SEND = 'SEND',
	}
</script>

<script lang="ts">
	import Muted from '$lib/components/typo/muted.svelte';

	import { cn, formatDatetimeString } from '$lib/utils';
	import UserAvatar from '$stories/components/Avatar.svelte';

	interface Props extends ReturnType<typeof $props> {
		dir: Direction;
		user: App.User;
		sentAt: Date;
	}

	const { children, dir, user, sentAt }: Props = $props();
</script>

<article class={cn('flex', dir === Direction.SEND && 'flex-row-reverse')}>
	{#if dir === Direction.RECEIVE}
		<UserAvatar class="m-2 size-9 flex-none" {user} />
	{/if}
	<div class={cn('flex flex-col', dir === Direction.SEND ? 'items-end' : 'items-start')}>
		<section
			class={cn(
				'relative size-fit p-4 text-left',
				dir === Direction.SEND ? 'bg-primary mr-3' : 'bg-secondary ml-2',
			)}>
			{@render children()}
			<div
				class={cn(
					'absolute top-4.5 z-50 size-4 rotate-45',
					dir === Direction.SEND ? 'bg-primary right-[-8px]' : 'bg-secondary left-[-8px]',
				)}>
			</div>
		</section>
		<Muted class="mx-3 flex-none">{formatDatetimeString(sentAt)}</Muted>
	</div>
</article>
