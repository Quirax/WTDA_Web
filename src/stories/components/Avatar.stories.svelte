<svelte:options runes />

<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Avatar from './Avatar.svelte';
	import { UserStatus } from '../../app';
	import ProfileExample from '../assets/profile_example.png';

	// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
	const { Story } = defineMeta({
		title: 'Components/Avatar',
		component: Avatar,
		// This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
		tags: ['autodocs'],
		parameters: {
			// More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
			layout: 'fullscreen',
		},
	});
</script>

<Story
	name="Avatar with Profile Image"
	args={{
		user: {
			id: 'quiraxical',
			username: 'Quirax Lee',
			profileImage: ProfileExample,
			email: '',
			status: UserStatus.REQUIRED_EMAIL_CONFIRM,
		},
	}} />

<Story
	name="Avatar without Profile Image"
	args={{
		user: {
			id: 'quiraxical',
			username: 'Quirax Lee',
			profileImage: null,
			email: '',
			status: UserStatus.REQUIRED_EMAIL_CONFIRM,
		},
	}} />
