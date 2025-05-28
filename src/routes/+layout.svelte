<script lang="ts">
	import '../app.css';
	import type { LayoutServerData } from './$types';
	import { sessionStore, userStore } from '$lib/context';
	import Layout from '$stories/Layout.svelte';
	import { afterNavigate, invalidate } from '$app/navigation';
	import { Toaster } from '$lib/components/ui/sonner';
	import { ModeWatcher } from 'mode-watcher';

	interface Props extends ReturnType<typeof $props> {
		data: LayoutServerData;
	}

	let { children, data }: Props = $props();

	userStore.set(data.user);
	sessionStore.set(data.session);

	afterNavigate(() => {
		invalidate('/').then(() => {
			userStore.set(data.user);
			sessionStore.set(data.session);
		});
	});
</script>

<ModeWatcher />
<Toaster />

<Layout>
	{@render children()}
</Layout>
