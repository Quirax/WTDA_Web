<svelte:options runes />

<script lang="ts">
	import { fn } from '@storybook/test';

	import './Layout.css';
	import Footer from './components/Footer.svelte';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import { i18n } from '$lib/i18n';

	let { children = fn() } = $props();
</script>

<ParaglideJS {i18n}>
	{@render children()}
	<Footer />
</ParaglideJS>
