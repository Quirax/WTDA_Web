<svelte:options runes />

<script lang="ts">
	import * as AlertDialog from '$lib/components/ui/alert-dialog';

	import { fn } from '@storybook/test';

	import './Layout.css';
	import Header from './components/Header.svelte';
	import Footer from './components/Footer.svelte';
	import type { Snippet } from 'svelte';
	import { layoutStore } from '$lib/context';

	export interface Alert {
		title: string;
		description: string | Snippet;
		cancel?: boolean | string;
		action?: boolean | string;
		onCancel?: () => void;
		onAction?: () => void;
	}

	interface Props extends ReturnType<typeof $props> {
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
		alert,
		openAlert = false,
	}: Props = $props();

	layoutStore.subscribe((v) => {
		if (!v) return;

		title = v.title;
		showSearchPanel = v.showSearchPanel ?? true;
		showUserPanel = v.showUserPanel ?? true;
		alert = v.alert;
		openAlert = v.openAlert ?? false;

		console.log(v);
	});

	$effect(() => {
		layoutStore.update((value) => {
			const newValue = { ...value };

			newValue.openAlert = openAlert;

			return newValue;
		});
	});

	const onLogin = () => {
		window.location.href = '/login';
	};
	const onLogout = () => {
		window.location.href = '/logout';
	};
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
				<AlertDialog.Cancel onclick={alert?.onCancel || fn}>
					{typeof alert.cancel === 'string' ? alert.cancel : '취소'}
				</AlertDialog.Cancel>
			{/if}
			{#if alert?.action || !alert?.cancel}
				<AlertDialog.Action
					onclick={() => {
						openAlert = false;
						(alert?.onAction || fn)();
					}}>
					{typeof alert?.action === 'string' ? alert?.action : '확인'}
				</AlertDialog.Action>
			{/if}
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
