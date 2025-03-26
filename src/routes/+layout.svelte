<script lang="ts">
	import '../app.css';
	import { i18n } from '$lib/i18n';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import type { LayoutServerData } from './$types';
	import { layoutStore, sessionStore, userStore } from '$lib/context';
	import Layout from '$stories/Layout.svelte';
	import { afterNavigate, invalidate } from '$app/navigation';

	interface Props extends ReturnType<typeof $props> {
		data: LayoutServerData;
	}

	let { children, data }: Props = $props();

	userStore.set(data.user);
	sessionStore.set(data.session);

	$effect.pre(() => {
		layoutStore.set({
			title: '뭐하지공방',
			showSearchPanel: true,
			showUserPanel: true,
			openAlert: false,
		});
	});

	afterNavigate(() => {
		invalidate('/').then(() => {
			userStore.set(data.user);
			sessionStore.set(data.session);
		});
	});
</script>

<ParaglideJS {i18n}>
	<Layout>
		{@render children()}
	</Layout>
</ParaglideJS>
