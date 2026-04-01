/**
 * Video Capture Screen (Screen 10)
 * Placeholder — full camera integration in Sprint 3
 */

import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useSettings } from '@/context/SettingsContext';

export default function CameraScreen() {
    const router = useRouter();
    const { resolvedTheme } = useSettings();
    const colors = Colors[resolvedTheme];

    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: 'Capture Video',
                    headerStyle: { backgroundColor: colors.surface },
                    headerTintColor: colors.text,
                }}
            />
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.content}>
                    <Text style={styles.icon}>📹</Text>
                    <Text style={[styles.title, { color: colors.text }]}>
                        Video Capture
                    </Text>
                    <Text style={[styles.body, { color: colors.textSecondary }]}>
                        Camera recording will be available in Sprint 3. This screen will
                        support standard and slow-motion video, with a frame ruler overlay
                        for measurements.
                    </Text>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: colors.primary }]}
                        onPress={() => router.back()}
                        accessibilityLabel="Go back"
                        accessibilityRole="button"
                    >
                        <Text style={styles.buttonText}>← Go Back</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </>
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
        marginBottom: Spacing.md,
    },
    body: {
        fontSize: Typography.bodyLarge.fontSize,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: Spacing.xxl,
    },
    button: {
        paddingHorizontal: Spacing.xxl,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: Typography.labelLarge.fontSize,
        fontWeight: '600',
    },
});
