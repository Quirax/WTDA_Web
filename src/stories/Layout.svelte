<svelte:options runes />

<script lang="ts">
	import { fn } from '@storybook/test';
	import 'photoswipe/style.css';

	import './Layout.css';
	import Footer from './components/Footer.svelte';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import { page } from '$app/state';

	let { children = fn() } = $props();
</script>

{@render children()}
<Footer />

<div style="display:none">
	{#each locales as locale}
		<a href={localizeHref(page.url.pathname, { locale })}>{locale}</a>
	{/each}
</div>
