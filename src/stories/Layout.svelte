<svelte:options runes />

<script lang="ts">
	import { fn } from '@storybook/test';

	import './Layout.css';
	import Header from './Header.svelte';
	import Footer from './Footer.svelte';
	import type { HTMLSlotAttributes } from 'svelte/elements';

	interface Props extends HTMLSlotAttributes {
		user?: App.User;
		onLogin?: () => void;
		onLogout?: () => void;
		title?: string;
		showSearchPanel?: boolean;
		showUserPanel?: boolean;
	}

	const {
		user,
		onLogin = fn(),
		onLogout = fn(),
		children = fn(),
		title,
		showSearchPanel = true,
		showUserPanel = true,
	}: Props = $props();
</script>

<Header {user} {onLogin} {onLogout} {title} {showSearchPanel} {showUserPanel} />

{@render children()}

<Footer />
