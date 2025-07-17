<script lang="ts">
	import '../app.css';
	import type { LayoutServerData } from './$types';
	import { sessionStore, userStore } from '$lib/context';
	import Layout from '$stories/Layout.svelte';
	import { afterNavigate, invalidate } from '$app/navigation';
	import { Toaster } from '$lib/components/ui/sonner';
	import { ModeWatcher } from 'mode-watcher';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { browser, dev } from '$app/environment';
	import { getFirebaseApp, getMessaging, getToken } from '$lib/firebase';
	import { env } from '$env/dynamic/public';
	import { deserialize } from '$app/forms';
	import { m } from '$lib/messages';
	import AlertDialog from '$stories/components/AlertDialog.svelte';

	interface Props extends ReturnType<typeof $props> {
		data: LayoutServerData;
	}

	let { children, data }: Props = $props();

	userStore.set(data.user);
	sessionStore.set(data.session);

	afterNavigate(() => {
		invalidate('session').then(() => {
			userStore.set(data.user);
			sessionStore.set(data.session);
		});
	});

	if (browser && data.user) {
		const firebase = getFirebaseApp();
		const messaging = getMessaging(firebase);

		const requestNotificationPermission = (
			reject?: (_: 'permission_rejected' | 'token_failed') => void,
		) => {
			// ref: https://yoohyeon.tistory.com/156
			Notification.requestPermission()
				.then((permission) => {
					if (permission === 'granted') {
						// ref: https://svelte.dev/docs/kit/service-workers#During-development
						navigator.serviceWorker
							.register('/service-worker.js', {
								type: dev ? 'module' : 'classic',
							})
							.then((register) =>
								getToken(messaging, {
									vapidKey: env.PUBLIC_FIREBASE_VAPID_KEY,
									serviceWorkerRegistration: register,
								}),
							)
							.then((token) => {
								const body = new FormData();
								body.append('token', token);

								return fetch('/?/registerNotificationToken', { method: 'post', body });
							})
							.then((r) => r.text())
							.then((r) => deserialize(r))
							.then((result) => {
								if (result.type === 'success') {
									/* noop */
								} else throw Error(JSON.stringify(result));
							})
							.catch((err) => {
								console.error(err);
								reject?.('token_failed');
							});
					} else {
						reject?.('permission_rejected');
					}
				})
				.catch(() => {
					reject?.('permission_rejected');
				});
		};

		onMount(() => {
			if ('serviceWorker' in navigator) {
				requestNotificationPermission((reason) => {
					switch (reason) {
						case 'permission_rejected':
							toast.info(m['NOTIFICATION.PERMISSION_REJECTED.TITLE'](), {
								action: {
									label: m['NOTIFICATION.PERMISSION_REJECTED.ACTION'](),
									onClick: () => requestNotificationPermission,
								},
							});
							break;
						case 'token_failed':
							toast.error(m['NOTIFICATION.TOKEN_FAILED.TITLE'](), {
								description:
									// ref: https://stackoverflow.com/a/69624651/21742011
									m['NOTIFICATION.TOKEN_FAILED.DESCRIPTION'](),
							});
							break;
					}
				});
			}
		});
	}

	let openDemoAlert = $state(false);

	onMount(() => {
		const affirmed = sessionStorage.getItem('demo');

		if (!affirmed) openDemoAlert = true;
	});
</script>

<ModeWatcher />
<Toaster />

<Layout>
	{@render children()}
</Layout>

<AlertDialog
	title="이 사이트는 데모용 샘플입니다."
	description="이 사이트는 데모용으로, 실제 운영되는 사이트가 아닙니다. 다만, 게시물 작성 등 세부적인 체험을 위해 개발자에게 계정을 신청할 수 있습니다. 이 점 참고하여 주시기 바랍니다."
	bind:open={openDemoAlert}
	onAction={() => {
		sessionStorage.setItem('demo', 'demo');
	}} />
