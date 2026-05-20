import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import {
    createUserWithEmailAndPassword,
    signOut as fbSignOut,
    initializeAuth,
    onAuthStateChanged,
    sendPasswordResetEmail,
    signInAnonymously,
    signInWithEmailAndPassword,
    type User,
} from 'firebase/auth';
// @ts-ignore — getReactNativePersistence is in the RN bundle but not in the web type defs
import { getReactNativePersistence } from 'firebase/auth';
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


if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.warn(
        'Firebase config missing — copy .env.example to .env and fill in your project keys.'
    );
}

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
export const storage = getStorage(app);

/** Sign in anonymously — legacy fallback. */
export async function signInAnon() {
    try {
        const result = await signInAnonymously(auth);
        return result.user;
    } catch (error) {
        console.warn('Anonymous auth failed:', error);
        return null;
    }
}

/** Create a new team account with email + password. */
export async function signUpWithEmail(email: string, password: string): Promise<User> {
    const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    return credential.user;
}

/** Sign in an existing team. */
export async function signInWithEmail(email: string, password: string): Promise<User> {
    const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
    return credential.user;
}

/** Sign out the current team (clears Firebase session + AsyncStorage). */
export async function signOut(): Promise<void> {
    await fbSignOut(auth);
}

/** Send a password reset email. */
export async function sendPasswordReset(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email.trim());
}

/** Subscribe to Firebase auth-state changes. Returns the unsubscribe function. */
export function subscribeToAuth(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
}

/** Map Firebase auth error codes to friendly student-facing messages. */
export function authErrorMessage(err: unknown): string {
    const code = (err as { code?: string })?.code ?? '';
    switch (code) {
        case 'auth/email-already-in-use':
            return 'A team is already registered with this email. Try logging in instead.';
        case 'auth/invalid-email':
            return 'That email address doesn\'t look right. Please check and try again.';
        case 'auth/weak-password':
            return 'Password is too weak. Use at least 6 characters.';
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            return 'Email or password is incorrect.';
        case 'auth/too-many-requests':
            return 'Too many failed attempts. Wait a minute and try again.';
        case 'auth/network-request-failed':
            return 'Network error. Check your connection and try again.';
        default:
            return 'Something went wrong. Please try again.';
    }
}

export default app;
