import admin from 'firebase-admin';
import serviceAccount from '../../../.firebase-admin-credential.json';

export const firebaseAdmin = admin.initializeApp({
	credential: admin.credential.cert({
		projectId: serviceAccount.project_id,
		clientEmail: serviceAccount.client_email,
		privateKey: serviceAccount.private_key,
	}),
});
