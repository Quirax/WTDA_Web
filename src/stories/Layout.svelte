<svelte:options runes />

<script lang="ts">
	import * as AlertDialog from '$lib/components/ui/alert-dialog';

	import { fn } from '@storybook/test';

	import './Layout.css';
	import Header from './components/Header.svelte';
	import Footer from './components/Footer.svelte';
	import type { HTMLSlotAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	export interface Alert {
		title: string;
		description: string | Snippet;
		cancel?: boolean | string;
		action?: boolean | string;
	}

	interface Props extends HTMLSlotAttributes {
		title?: string;
		showSearchPanel?: boolean;
		showUserPanel?: boolean;
		alert?: Alert;
		openAlert?: boolean;
	}

	let {
		children = fn(),
		title,
		showSearchPanel = true,
		showUserPanel = true,
		alert = undefined,
		openAlert = $bindable(false),
	}: Props = $props();

	const onLogin = () => {
		window.location.href = '/login';
	};
	const onLogout = () => {};
</script>

<Header {onLogin} {onLogout} {title} {showSearchPanel} {showUserPanel} />

{@render children()}

<Footer />

<AlertDialog.Root bind:open={openAlert}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{alert?.title}</AlertDialog.Title>
			<AlertDialog.Description>
				{#if typeof alert?.description === 'string'}
					{alert?.description}
				{:else}
					{@render alert?.description()}
				{/if}
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			{#if alert?.cancel}
				<AlertDialog.Cancel>
					{typeof alert.cancel === 'string' ? alert.cancel : '취소'}
				</AlertDialog.Cancel>
			{/if}
			{#if alert?.action || !alert?.cancel}
				<AlertDialog.Action
					onclick={() => {
						openAlert = false;
					}}>
					{typeof alert?.action === 'string' ? alert?.action : '확인'}
				</AlertDialog.Action>
			{/if}
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
