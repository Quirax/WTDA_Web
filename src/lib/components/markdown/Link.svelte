<script lang="ts">
	import type { MarkedRendererProps } from 'svelte-markdown';
	import { marked } from 'marked';
	import Button from '../ui/button/button.svelte';

	type $$Props = MarkedRendererProps<marked.Tokens.Link>;

	let href: $$Props['href'] = undefined;
	let title: $$Props['title'] = undefined;

	export { href, title };
</script>

<Button variant="link" class="text-base" {href} {title}><slot /></Button>
