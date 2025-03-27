<script lang="ts">
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import type { Snippet } from 'svelte';

	interface Props extends ReturnType<typeof $props> {
		title: string;
		description: string | Snippet;
		cancel?: boolean | string;
		action?: boolean | string;
		onCancel?: () => void;
		onAction?: () => void;
		open?: boolean;
	}

	let {
		title = '',
		description = '',
		cancel = false,
		action = true,
		onCancel,
		onAction,
		open = $bindable(false),
	}: Props = $props();
</script>

<AlertDialog.Root bind:open>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{title}</AlertDialog.Title>
			<AlertDialog.Description>
				{#if typeof description === 'string'}
					{description}
				{:else}
					{@render description()}
				{/if}
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			{#if cancel}
				<AlertDialog.Cancel onclick={onCancel || (() => {})}>
					{typeof cancel === 'string' ? cancel : '취소'}
				</AlertDialog.Cancel>
			{/if}
			{#if action || !cancel}
				<AlertDialog.Action
					onclick={() => {
						open = false;
						(onAction || (() => {}))();
					}}>
					{typeof action === 'string' ? action : '확인'}
				</AlertDialog.Action>
			{/if}
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
