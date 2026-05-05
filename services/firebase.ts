/**
 * Firebase Configuration
 * * SETUP INSTRUCTIONS:
 * 1. Go to Firebase Console: https://console.firebase.google.com
 * 2. Select your project (or create one)
 * 3. Click the gear icon → Project Settings
 * 4. Scroll to "Your apps" → Click "Add app" → Web (</>)
 * 5. Register app name (e.g. "STEMM Labs")
 * 6. Copy the firebaseConfig values below
 * 7. Replace the placeholder values in this file
 * * Also enable these Firebase services:
 * - Authentication → Sign-in method → Anonymous (enable it)
 * - Firestore Database → Create database → Start in test mode
 * - Storage → Get started → Start in test mode
 */

import { initializeApp } from 'firebase/app';
// @ts-ignore — getReactNativePersistence exists in RN bundle but not in web type defs
import { initializeAuth, getReactNativePersistence, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: 'YOUR_API_KEY',
    authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_PROJECT_ID.firebasestorage.app',
    messagingSenderId: 'YOUR_SENDER_ID',
    appId: 'YOUR_APP_ID',
};

const app = initializeApp(firebaseConfig);

// Use initializeAuth with AsyncStorage persistence to persist auth state
// across sessions. This fixes the warning about memory-only persistence.
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
export const storage = getStorage(app);

/**
 * Sign in anonymously — called on app start.
 */
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