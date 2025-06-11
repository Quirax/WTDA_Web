<script lang="ts" module>
	export enum Direction {
		RECEIVE = 'RECEIVE',
		SEND = 'SEND',
	}
</script>

<script lang="ts">
	import Muted from '$lib/components/typo/muted.svelte';

	import { cn, formatDatetimeString, sanitizeHTML, twemoji } from '$lib/utils';
	import UserAvatar from '$stories/components/Avatar.svelte';

	interface Props extends ReturnType<typeof $props> {
		dir: Direction;
		dm: App.DM;
		prev?: App.DM;
		next?: App.DM;
	}

	const { children, dir, dm, prev, next }: Props = $props();

	const sameSenderAsPrev =
		!['join', 'leave'].includes(prev?.type || '') && prev?.sender?.id === dm.sender?.id;
	const sameSenderAsNext =
		!['join', 'leave'].includes(next?.type || '') && next?.sender?.id === dm.sender?.id;
</script>

<article class={cn('flex', dir === Direction.SEND && 'flex-row-reverse')}>
	{#if dir === Direction.RECEIVE && !['join', 'leave'].includes(dm.type)}
		{#if !sameSenderAsPrev}
			<UserAvatar class="m-2 size-9 flex-none" user={dm.sender} />
		{:else}
			<!-- 이전 사용자와 같은 경우 여백으로 표시-->
			<div class="m-2 size-9 flex-none"></div>
		{/if}
	{/if}
	<div class={cn('flex w-full flex-col', dir === Direction.SEND ? 'items-end' : 'items-start')}>
		{#if dm.type === 'general'}
			<section
				class={cn(
					'relative size-fit p-4 text-left',
					dir === Direction.SEND ? 'bg-primary mr-3' : 'bg-secondary ml-2',
				)}
				use:twemoji>
				{@html sanitizeHTML(dm.message.replace(/\n/g, '<br>'))}
				{#if !sameSenderAsPrev}
					<!-- 이전 사용자와 같은 경우 말풍선 꼬리 미표시 -->
					<div
						class={cn(
							'absolute top-4.5 z-50 size-4 rotate-45',
							dir === Direction.SEND ? 'bg-primary right-[-8px]' : 'bg-secondary left-[-8px]',
						)}>
					</div>
				{/if}
			</section>
			{#if !sameSenderAsNext || formatDatetimeString(next?.sentAt || new Date(0)) !== formatDatetimeString(dm.sentAt)}
				<!-- 다음 사용자와 같은 경우 보낸 시간 미표시 -->
				<Muted class="mx-3 flex-none">{formatDatetimeString(dm.sentAt)}</Muted>
			{/if}
		{:else if dm.type === 'join'}
			<Muted class="w-full text-center">{dm.sender?.username} 님이 대화방에 들어왔습니다.</Muted>
		{:else if dm.type === 'leave'}
			<Muted class="w-full text-center">
				{dm.sender?.username} 님이 대화방에서 나갔습니다.
			</Muted>{/if}
	</div>
</article>
