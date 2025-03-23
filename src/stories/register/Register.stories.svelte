<svelte:options runes />

<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Register from './Register.svelte';

	// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
	const { Story } = defineMeta({
		title: 'User Management/Register',
		component: Register,
		parameters: {
			// More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
			layout: 'fullscreen',
		},
	});
</script>

<Story name="Default" />
