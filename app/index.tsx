import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { useTeam } from '@/context/TeamContext';

export default function SplashScreen() {
    const router = useRouter();
    const { resolvedTheme } = useSettings();
    const { user, isLoading: authLoading } = useAuth();
    const { team, isLoading: teamLoading } = useTeam();
    const colors = Colors[resolvedTheme];

    useEffect(() => {
        if (authLoading || teamLoading) return;

        // Short delay so the splash is briefly visible
        const timer = setTimeout(() => {
            if (!user) {
                router.replace('/login');
            } else if (!team) {
                router.replace('/register');
            } else {
                router.replace('/(tabs)');
            }
        }, 600);

        return () => clearTimeout(timer);
    }, [authLoading, teamLoading, user, team]);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.iconWrap, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="flask-outline" size={48} color={colors.primary} />
            </View>
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
    iconWrap: {
        width: 96,
        height: 96,
        borderRadius: BorderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
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
    spinner: { marginTop: Spacing.xl },
});
