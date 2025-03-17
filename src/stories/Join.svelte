<svelte:options runes />

<script lang="ts">
	import { UserStatus } from '../app';

	import { fn } from '@storybook/test';

	import Layout from './Layout.svelte';
	import Section from './components/Section.svelte';

	interface Props {
		onSubmit?: (data: App.User) => boolean;
	}

	const { onSubmit = fn() }: Props = $props();

	let user: App.User = {
		id: '',
		username: '',
		profileImage: null,
		fallbackInitial: '',
		email: '',
		status: UserStatus.REQUIRED_EMAIL_CONFIRM,
	};
</script>

<Layout title="회원가입" showSearchPanel={false} showUserPanel={false}>
	<Section>내용없음</Section>
</Layout>
