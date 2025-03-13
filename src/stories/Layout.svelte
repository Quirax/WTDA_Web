<svelte:options runes />

<script lang="ts">
	import { fn } from '@storybook/test';

	import './Layout.css';
	import Header from './Header.svelte';
	import Footer from './Footer.svelte';
	import type { HTMLSlotAttributes } from 'svelte/elements';

	interface Props extends HTMLSlotAttributes {
		user?: { name: string };
		onLogin?: () => void;
		onLogout?: () => void;
	}

	const { user, onLogin = fn(), onLogout = fn(), children = fn() }: Props = $props();
</script>

<Header {user} {onLogin} {onLogout} />

{@render children()}

<Footer />
