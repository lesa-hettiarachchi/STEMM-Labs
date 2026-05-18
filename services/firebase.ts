/**
 * Firebase Configuration
 *
 * All credentials are loaded from environment variables (.env) so that
 * no API keys are hard-coded in source — see .env.example for the keys
 * required and Firebase Console for where to get them.
 *
 * Enabled Firebase services:
 *   - Authentication (Anonymous sign-in)
 *   - Firestore Database (teams, attempts, leaderboard)
 *   - Storage (video evidence upload)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
// @ts-ignore — getReactNativePersistence exists in RN bundle but not in web type defs
import { getReactNativePersistence, initializeAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Fail loudly in dev if .env wasn't set up
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.warn(
        '⚠️  Firebase config missing — copy .env.example to .env and fill in your project keys.'
    );
}

const app = initializeApp(firebaseConfig);

// initializeAuth with AsyncStorage persistence so anonymous sessions survive app restarts
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
export const storage = getStorage(app);

/** Sign in anonymously — called on app start so every team has a Firebase UID. */
export async function signInAnon() {
    try {
        const result = await signInAnonymously(auth);
        return result.user;
    } catch (error) {
        console.warn('Anonymous auth failed:', error);
        return null;
    }
}

export default app;
