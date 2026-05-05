/**
 * Splash / Redirect Screen
 * Checks if a team profile exists in AsyncStorage:
 *   - If registered → navigate to (tabs)
 *   - If not → navigate to register
 */

import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing, Typography } from '@/constants/theme';
import { useSettings } from '@/context/SettingsContext';
import { useTeam } from '@/context/TeamContext';

export default function SplashScreen() {
    const router = useRouter();
    const { resolvedTheme } = useSettings();
    const { team, isLoading } = useTeam();
    const colors = Colors[resolvedTheme];
    const [hasChecked, setHasChecked] = useState(false);

    useEffect(() => {
        if (isLoading) return;

        // Small delay so the splash is visible briefly
        const timer = setTimeout(() => {
            if (team) {
                router.replace('/(tabs)');
            } else {
                router.replace('/register');
            }
            setHasChecked(true);
        }, 800);

        return () => clearTimeout(timer);
    }, [isLoading, team]);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={styles.icon}>🔬</Text>
            <Text style={[styles.title, { color: colors.text }]}>STEMM Lab</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Real-World STEMM Games
            </Text>
            <ActivityIndicator
                size="large"
                color={colors.primary}
                style={styles.spinner}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        fontSize: 72,
        marginBottom: Spacing.lg,
    },
    title: {
        fontSize: Typography.headlineLarge.fontSize,
        fontWeight: Typography.headlineLarge.fontWeight,
        marginBottom: Spacing.xs,
    },
    subtitle: {
        fontSize: Typography.bodyLarge.fontSize,
        marginBottom: Spacing.xxl,
    },
    spinner: {
        marginTop: Spacing.xl,
    },
});
