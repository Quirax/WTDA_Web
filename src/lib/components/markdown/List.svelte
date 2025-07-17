<script lang="ts">
	import type { MarkedRendererProps } from 'svelte-markdown';
	import { marked } from 'marked';
	import Ul from '../typo/ul.svelte';

	type $$Props = MarkedRendererProps<marked.Tokens.List>;

	let ordered: $$Props['ordered'] = undefined;
	let loose: $$Props['loose'] = undefined;
	let start: $$Props['start'] = undefined;

	export { ordered, items, loose, start };

	let other = { loose, start: start === '' ? undefined : start };
</script>

{#if ordered}
	<ol class="list-decimal pl-14" {...other}>
		<slot />
	</ol>
{:else}
	<Ul {...other}>
		<slot />
	</Ul>
{/if}
