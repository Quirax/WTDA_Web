<script lang="ts" module>
	export enum Direction {
		RECEIVE = 'RECEIVE',
		SEND = 'SEND',
	}
</script>

<script lang="ts">
	import Muted from '$lib/components/typo/muted.svelte';

	import { cn, formatDatetimeString, sanitizeHTML } from '$lib/utils';
	import UserAvatar from '$stories/components/Avatar.svelte';

	interface Props extends ReturnType<typeof $props> {
		dir: Direction;
		dm: App.DM;
	}

	const { children, dir, dm }: Props = $props();
</script>

<article class={cn('flex', dir === Direction.SEND && 'flex-row-reverse')}>
	{#if dir === Direction.RECEIVE}
		<UserAvatar class="m-2 size-9 flex-none" user={dm.sender} />
	{/if}
	<div class={cn('flex flex-col', dir === Direction.SEND ? 'items-end' : 'items-start')}>
		{#if dm.type === 'general'}
			<section
				class={cn(
					'relative size-fit p-4 text-left',
					dir === Direction.SEND ? 'bg-primary mr-3' : 'bg-secondary ml-2',
				)}>
				{sanitizeHTML(dm.message)}
				<div
					class={cn(
						'absolute top-4.5 z-50 size-4 rotate-45',
						dir === Direction.SEND ? 'bg-primary right-[-8px]' : 'bg-secondary left-[-8px]',
					)}>
				</div>
			</section>
			<Muted class="mx-3 flex-none">{formatDatetimeString(dm.sentAt)}</Muted>
		{/if}
	</div>
</article>
