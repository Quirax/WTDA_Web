<script lang="ts">
	import type { MarkedRendererProps } from 'svelte-markdown';
	import { marked } from 'marked';
	import H1 from '../typo/h1.svelte';
	import H2 from '../typo/h2.svelte';
	import H3 from '../typo/h3.svelte';
	import H4 from '../typo/h4.svelte';

	type $$Props = MarkedRendererProps<marked.Tokens.Heading>;

	let depth: $$Props['depth'] = undefined;
	let text: $$Props['text'] = undefined;

	export { depth, text };

	// const { text }: MarkedRendererProps<marked.Tokens.Heading> = $props();
	const escapedText = (text || '').toLowerCase().replace(/\s/g, '-');
</script>

{#if depth === 1}
	<H1 class="mt-6" id={escapedText}><slot /></H1>
{:else if depth === 2}
	<H2 class="mt-6" id={escapedText}><slot /></H2>
{:else if depth === 3}
	<H3 class="mt-6" id={escapedText}><slot /></H3>
{:else if depth === 4}
	<H4 class="mt-6" id={escapedText}><slot /></H4>
{:else if depth === 5}
	<h5 class="mt-4" id={escapedText}><slot /></h5>
{:else if depth === 6}
	<h6 class="mt-4" id={escapedText}><slot /></h6>
{:else}
	<slot />
{/if}
