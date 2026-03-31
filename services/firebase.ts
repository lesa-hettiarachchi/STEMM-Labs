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

// CHANGE: Use standard 'firebase' imports instead of '@react-native-firebase'
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: 'YOUR_API_KEY',
    authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_PROJECT_ID.firebasestorage.app',
    messagingSenderId: 'YOUR_SENDER_ID',
    appId: 'YOUR_APP_ID',
};

// initializeApp is synchronous in the Web SDK, so no Promise errors here.
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
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