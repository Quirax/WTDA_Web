<svelte:options runes />

<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Header from './Header.svelte';
	import { fn } from '@storybook/test';
	import { UserStatus } from '../../app';

	// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
	const { Story } = defineMeta({
		title: 'Components/Header',
		component: Header,
		// This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
		tags: ['autodocs'],
		parameters: {
			// More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
			layout: 'fullscreen',
		},
		args: {
			onLogin: fn(),
			onLogout: fn(),
		},
	});
</script>

<Story
	name="Logged In"
	args={{
		user: {
			id: 'quiraxical',
			username: 'Quirax Lee',
			fallbackInitial: 'QR',
			profileImage: null,
			email: '',
			status: UserStatus.REQUIRED_EMAIL_CONFIRM,
		},
	}} />

<Story name="Logged Out" args={{}} />

<Story name="Custom Title" args={{ title: '커미션 찾기' }} />
