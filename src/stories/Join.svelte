<svelte:options runes />

<script lang="ts">
	import { fn } from '@storybook/test';

	import Layout from './Layout.svelte';

	interface Props {
		onSubmit?: (data: App.User) => boolean;
	}

	const { onSubmit = fn() }: Props = $props();

	let user: App.User = {
		id: '',
		username: '',
		profileImage: null,
		fallbackInitial: '',
	};
</script>

<Layout title="회원가입">내용없음</Layout>
