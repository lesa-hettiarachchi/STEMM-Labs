/**
 * Settings Screen (Screen 12)
 * Theme toggle, text size, data reset, app info
 */

import { useRouter } from 'expo-router';
import React from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/theme';
import { useSettings } from '@/context/SettingsContext';
import { useTeam } from '@/context/TeamContext';
import { clearAllData } from '@/services/storage';

const TEXT_SIZE_OPTIONS = [
    { label: 'Normal', value: 1.0 },
    { label: 'Large', value: 1.25 },
    { label: 'Extra Large', value: 1.5 },
] as const;

export default function SettingsScreen() {
    const router = useRouter();
    const {
        themeMode,
        textSizeMultiplier,
        resolvedTheme,
        setThemeMode,
        setTextSizeMultiplier,
    } = useSettings();
    const { clearTeam } = useTeam();
    const colors = Colors[resolvedTheme];

    const handleClearData = () => {
        Alert.alert(
            'Clear All Data',
            'This will delete your team profile, all activity progress, and settings. This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear Everything',
                    style: 'destructive',
                    onPress: async () => {
                        await clearAllData();
                        await clearTeam();
                        router.replace('/');
                    },
                },
            ]
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Theme Section */}
                <View style={[styles.section, { backgroundColor: colors.surface }, Shadows.sm]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        🎨 Appearance
                    </Text>

                    <View style={styles.themeOptions}>
                        {(['system', 'light', 'dark'] as const).map((mode) => (
                            <TouchableOpacity
                                key={mode}
                                style={[
                                    styles.themeOption,
                                    {
                                        backgroundColor:
                                            themeMode === mode
                                                ? colors.primary
                                                : colors.backgroundElement,
                                        borderColor:
                                            themeMode === mode ? colors.primary : colors.border,
                                    },
                                ]}
                                onPress={() => setThemeMode(mode)}
                                accessibilityLabel={`Set theme to ${mode}`}
                                accessibilityRole="button"
                            >
                                <Text style={styles.themeIcon}>
                                    {mode === 'system' ? '📱' : mode === 'light' ? '☀️' : '🌙'}
                                </Text>
                                <Text
                                    style={[
                                        styles.themeLabel,
                                        {
                                            color:
                                                themeMode === mode ? colors.onPrimary : colors.text,
                                        },
                                    ]}
                                >
                                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Text Size Section */}
                <View style={[styles.section, { backgroundColor: colors.surface }, Shadows.sm]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        🔤 Text Size
                    </Text>
                    <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>
                        Adjust text size for better readability
                    </Text>

                    <View style={styles.textSizeOptions}>
                        {TEXT_SIZE_OPTIONS.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    styles.textSizeOption,
                                    {
                                        backgroundColor:
                                            textSizeMultiplier === option.value
                                                ? colors.primary
                                                : colors.backgroundElement,
                                        borderColor:
                                            textSizeMultiplier === option.value
                                                ? colors.primary
                                                : colors.border,
                                    },
                                ]}
                                onPress={() => setTextSizeMultiplier(option.value)}
                                accessibilityLabel={`Set text size to ${option.label}`}
                                accessibilityRole="button"
                            >
                                <Text
                                    style={[
                                        styles.textSizeLabel,
                                        {
                                            fontSize: 14 * option.value,
                                            color:
                                                textSizeMultiplier === option.value
                                                    ? colors.onPrimary
                                                    : colors.text,
                                        },
                                    ]}
                                >
                                    {option.label}
                                </Text>
                                <Text
                                    style={[
                                        styles.textSizePercent,
                                        {
                                            color:
                                                textSizeMultiplier === option.value
                                                    ? 'rgba(255,255,255,0.7)'
                                                    : colors.textSecondary,
                                        },
                                    ]}
                                >
                                    {Math.round(option.value * 100)}%
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Preview */}
                    <View
                        style={[
                            styles.previewBox,
                            { backgroundColor: colors.backgroundElement },
                        ]}
                    >
                        <Text
                            style={{
                                fontSize: Typography.bodyLarge.fontSize * textSizeMultiplier,
                                color: colors.text,
                            }}
                        >
                            Preview text at current size
                        </Text>
                    </View>
                </View>

                {/* Danger Zone */}
                <View style={[styles.section, { backgroundColor: colors.surface }, Shadows.sm]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        ⚠️ Data Management
                    </Text>

                    <TouchableOpacity
                        style={[styles.dangerButton, { backgroundColor: colors.error + '15' }]}
                        onPress={handleClearData}
                        accessibilityLabel="Clear all app data"
                        accessibilityRole="button"
                    >
                        <Text style={[styles.dangerButtonText, { color: colors.error }]}>
                            Clear All Data
                        </Text>
                        <Text
                            style={[
                                styles.dangerHint,
                                { color: colors.error + 'AA' },
                            ]}
                        >
                            Removes team profile, progress, and settings
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* App Info */}
                <View style={styles.appInfo}>
                    <Text style={[styles.appName, { color: colors.textSecondary }]}>
                        STEMM Lab v1.0.0
                    </Text>
                    <Text style={[styles.appCredits, { color: colors.textSecondary }]}>
                        CSE3MAD – Mobile Application Development
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: Spacing.lg, paddingBottom: Spacing.xxxxl },
    section: {
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
        marginBottom: Spacing.lg,
    },
    sectionTitle: {
        fontSize: Typography.titleMedium.fontSize,
        fontWeight: '600',
        marginBottom: Spacing.sm,
    },
    sectionHint: {
        fontSize: Typography.bodyMedium.fontSize,
        marginBottom: Spacing.lg,
    },
    themeOptions: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginTop: Spacing.sm,
    },
    themeOption: {
        flex: 1,
        paddingVertical: Spacing.lg,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        alignItems: 'center',
    },
    themeIcon: { fontSize: 24, marginBottom: Spacing.xs },
    themeLabel: {
        fontSize: Typography.labelLarge.fontSize,
        fontWeight: '500',
    },
    textSizeOptions: {
        gap: Spacing.sm,
    },
    textSizeOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
    },
    textSizeLabel: {
        fontWeight: '500',
    },
    textSizePercent: {
        fontSize: Typography.bodyMedium.fontSize,
    },
    previewBox: {
        marginTop: Spacing.lg,
        padding: Spacing.lg,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
    },
    dangerButton: {
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        marginTop: Spacing.sm,
    },
    dangerButtonText: {
        fontSize: Typography.labelLarge.fontSize,
        fontWeight: '600',
    },
    dangerHint: {
        fontSize: Typography.bodyMedium.fontSize,
        marginTop: Spacing.xxs,
    },
    appInfo: {
        alignItems: 'center',
        padding: Spacing.xl,
    },
    appName: {
        fontSize: Typography.bodyMedium.fontSize,
        fontWeight: '500',
    },
    appCredits: {
        fontSize: Typography.labelSmall.fontSize,
        marginTop: Spacing.xxs,
    },
});
