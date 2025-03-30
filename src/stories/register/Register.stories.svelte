<svelte:options runes />

<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import UserInfo, { UserInfoFor } from '../settings/info/UserInfo.svelte';

	// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
	const { Story } = defineMeta({
		title: 'User Management/Register',
		component: UserInfo,
		parameters: {
			// More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
			layout: 'fullscreen',
		},
		args: {
			for: UserInfoFor.REGISTRATION,
		},
	});
</script>

<Story name="Default" />
