<svelte:options runes />

<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Section from './Section.svelte';

	// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
	const { Story } = defineMeta({
		title: 'Components/Section',
		component: Section,
		// This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
		parameters: {
			// More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
			layout: 'fullscreen',
		},
	});
</script>

<Story name="Default">
	<Section>냉무</Section>
</Story>
