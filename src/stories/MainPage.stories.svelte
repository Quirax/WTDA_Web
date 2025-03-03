<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, waitFor, within } from '@storybook/test';
	import Page from './MainPage.svelte';
	import { fn } from '@storybook/test';

	// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
	const { Story } = defineMeta({
		title: 'MainPage',
		component: Page,
		parameters: {
			// More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
			layout: 'fullscreen'
		}
	});
</script>

<Story
	name="Logged In"
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const loginButton = canvas.getByRole('button', { name: /Log in/i });
		await expect(loginButton).toBeInTheDocument();
		await userEvent.click(loginButton);
		await waitFor(() => expect(loginButton).not.toBeInTheDocument());
		const userMenuButton = canvas.getByRole('button', { name: /User Menu/i });
		await expect(userMenuButton).toBeInTheDocument();
	}}
/>

<Story name="Logged Out" />
