<script module lang="ts">
	import type { Snippet } from 'svelte';
	import Button from './components/ui/button/button.svelte';

	export const replace = { link: replaceLink, format: replaceFormat };
</script>

{#snippet defaultLink(href: string, text: string)}
	<Button variant="link" {href}>{text}</Button>
{/snippet}

{#snippet replaceLink(message: string, link = defaultLink)}
	{#each message.split('\u0000') as token}
		{#if token.includes('\u0001')}
			{@const [href, text] = token.split('\u0001')}
			{@render link(href, text)}
		{:else}
			{token}
		{/if}
	{/each}
{/snippet}

{#snippet replaceFormat(
	message: string,
	format: Snippet<[string]>,
	delimiter = '\u0002',
	defaultFormat?: Snippet<[string]>,
)}
	{#each message.split(delimiter) as token, idx}
		{#if idx % 2 === 0}
			{#if defaultFormat}
				{@render defaultFormat(token)}
			{:else}
				{token}
			{/if}
		{:else}
			{@render format(token)}
		{/if}
	{/each}
{/snippet}
