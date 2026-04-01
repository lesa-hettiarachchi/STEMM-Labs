/**
 * Leaderboard Screen (Screen 5) — Placeholder
 * Full implementation in Sprint 3
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing, Typography } from '@/constants/theme';
import { useSettings } from '@/context/SettingsContext';

export default function LeaderboardScreen() {
    const { resolvedTheme } = useSettings();
    const colors = Colors[resolvedTheme];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.content}>
                <Text style={styles.icon}>🏆</Text>
                <Text style={[styles.title, { color: colors.text }]}>Leaderboard</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Complete activities to see your ranking here!
                </Text>
                <Text style={[styles.hint, { color: colors.textSecondary }]}>
                    Rankings will appear after teams submit their results.
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    icon: { fontSize: 64, marginBottom: Spacing.lg },
    title: {
        fontSize: Typography.headlineMedium.fontSize,
        fontWeight: Typography.headlineMedium.fontWeight,
        marginBottom: Spacing.sm,
    },
    subtitle: {
        fontSize: Typography.bodyLarge.fontSize,
        textAlign: 'center',
        marginBottom: Spacing.sm,
    },
    hint: {
        fontSize: Typography.bodyMedium.fontSize,
        textAlign: 'center',
        fontStyle: 'italic',
    },
});
