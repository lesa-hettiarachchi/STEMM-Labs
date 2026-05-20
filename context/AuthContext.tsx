import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import {
    signInWithEmail as fbSignInWithEmail,
    signUpWithEmail as fbSignUpWithEmail,
    signOut as fbSignOut,
    subscribeToAuth,
} from '@/services/firebase';

interface AuthContextValue {
    user: User | null;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<User>;
    signUp: (email: string, password: string) => Promise<User>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
    user: null,
    isLoading: true,
    signIn: async () => { throw new Error('AuthContext not ready'); },
    signUp: async () => { throw new Error('AuthContext not ready'); },
    signOut: async () => { throw new Error('AuthContext not ready'); },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = subscribeToAuth((u) => {
            setUser(u);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const signIn = (email: string, password: string) => fbSignInWithEmail(email, password);
    const signUp = (email: string, password: string) => fbSignUpWithEmail(email, password);
    const signOut = () => fbSignOut();

    return (
        <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
