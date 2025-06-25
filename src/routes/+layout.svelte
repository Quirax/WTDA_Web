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
							toast.info('데스크톱 알림을 받으시려면 알림을 허용해주세요.', {
								action: {
									label: '알림 허용',
									onClick: () => requestNotificationPermission,
								},
							});
							break;
						case 'token_failed':
							toast.error('데스크톱 알림 활성화를 위한 토큰을 얻지 못했습니다.', {
								description:
									// ref: https://stackoverflow.com/a/69624651/21742011
									'Brave 브라우저를 사용하는 경우 설정에서 "푸시 메시지에 Google 서비스 사용"를 활성화해주세요.',
							});
							break;
					}
				});
			}
		});
	}
</script>

<ModeWatcher />
<Toaster />

<Layout>
	{@render children()}
</Layout>
