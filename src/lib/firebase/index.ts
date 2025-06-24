// Import the functions you need from the SDKs you need
import { initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { env } from '$env/dynamic/public';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export type { FirebaseOptions } from 'firebase/app';

export const firebaseConfig: FirebaseOptions = {
	apiKey: env.PUBLIC_FIREBASE_API_KEY,
	authDomain: env.PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId: env.PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: env.PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	appId: env.PUBLIC_FIREBASE_APP_ID,
	measurementId: env.PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
export const getFirebaseApp = () => initializeApp(firebaseConfig);

export { getMessaging, getToken } from 'firebase/messaging';
// const analytics = getAnalytics(app);
