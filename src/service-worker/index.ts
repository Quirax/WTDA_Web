/// <reference types="@sveltejs/kit" />
/// <reference types="../../.svelte-kit/ambient.d.ts" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

const sw = self as unknown as ServiceWorkerGlobalScope;

import * as firebase from '../lib/firebase/sw';

const firebaseApp = firebase.getFirebaseApp();
const messaging = firebase.getMessaging(firebaseApp);

firebase.onBackgroundMessage(messaging, (payload) => {
	console.log('[SW] Received background message ', payload);

	// Customize notification here
	const notificationTitle = 'Background Message Title';
	const notificationOptions = {
		body: 'Background Message body.',
		icon: '/firebase-logo.png',
	};

	sw.registration.showNotification(notificationTitle, notificationOptions);
});
