<script lang="ts">
	import { type ComponentProps } from 'svelte';
	import SvelteMarkdown from 'svelte-markdown';
	import * as Typo from '$lib/components/typo';
	import Heading from './Heading.svelte';
	import List from './List.svelte';
	import Paragraph from './Paragraph.svelte';

	interface Props {
		md: string;
	}

	const { md }: Props = $props();

	const renderers: ComponentProps<SvelteMarkdown>['renderers'] = {
		paragraph: Paragraph,
		blockquote: Typo.Blockquote,
		code: Typo.Code,
		codespan: Typo.Code,
		heading: Heading,
		list: List,
		// table: ,
		tablerow: Typo.Table.Tr,
		// tablecell: ,
	};
</script>

<SvelteMarkdown source={md} {renderers} />
