import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

for (const [key, value] of Object.entries(firebaseConfig)) {
	if (typeof value !== 'string' || !value.trim()) {
		throw new Error(`Missing Firebase env: ${key}`);
	}

	if (value.includes('your_') || value.includes('your-project-id')) {
		throw new Error(`Invalid Firebase env placeholder detected: ${key}`);
	}
}

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
