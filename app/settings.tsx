import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
    Text as RNText
} from 'react-native';
import { ThemedText as Text } from '@/components/ThemedText';

import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
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
    const { user, signOut } = useAuth();
    const colors = Colors[resolvedTheme];

    const [selectedTextSizeMultiplier, setSelectedTextSizeMultiplier] = useState(textSizeMultiplier);

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

    const handleLogout = () => {
        Alert.alert(
            'Log Out',
            'Local activity progress will stay on this device but will be hidden until you log back in.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Log Out',
                    style: 'destructive',
                    onPress: async () => {
                        await clearTeam();          // forget team locally
                        await signOut();            // clear Firebase session
                        router.replace('/login');
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
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm }}>
                        <Ionicons name="color-palette-outline" size={24} color={colors.primary} style={{ marginRight: Spacing.sm }} />
                        <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>
                            Theme
                        </Text>
                    </View>

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
                                <Ionicons
                                    name={mode === 'system' ? 'phone-portrait-outline' : mode === 'light' ? 'sunny-outline' : 'moon-outline'}
                                    size={24}
                                    color={themeMode === mode ? colors.onPrimary : colors.text}
                                    style={{ marginBottom: Spacing.xs }}
                                />
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
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm }}>
                        <Ionicons name="text-outline" size={24} color={colors.primary} style={{ marginRight: Spacing.sm }} />
                        <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>
                            Text Size
                        </Text>
                    </View>
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
                                            selectedTextSizeMultiplier === option.value
                                                ? colors.primary
                                                : colors.backgroundElement,
                                        borderColor:
                                            selectedTextSizeMultiplier === option.value
                                                ? colors.primary
                                                : colors.border,
                                    },
                                ]}
                                onPress={() => setSelectedTextSizeMultiplier(option.value)}
                                accessibilityLabel={`Set text size to ${option.label}`}
                                accessibilityRole="button"
                            >
                                <Text
                                    style={[
                                        styles.textSizeLabel,
                                        {
                                            fontSize: 14 * option.value,
                                            color:
                                                selectedTextSizeMultiplier === option.value
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
                                                selectedTextSizeMultiplier === option.value
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
                        <RNText
                            style={{
                                fontSize: Typography.bodyLarge.fontSize * selectedTextSizeMultiplier,
                                color: colors.text,
                            }}
                        >
                            Preview text at current size
                        </RNText>
                    </View>

                    {selectedTextSizeMultiplier !== textSizeMultiplier && (
                        <TouchableOpacity
                            style={[styles.confirmButton, { backgroundColor: colors.primary }]}
                            onPress={() => setTextSizeMultiplier(selectedTextSizeMultiplier)}
                        >
                            <Text style={[styles.confirmButtonText, { color: colors.onPrimary }]}>
                                Confirm Selection
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Account */}
                {user && (
                    <View style={[styles.section, { backgroundColor: colors.surface }, Shadows.sm]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm }}>
                            <Ionicons name="person-circle-outline" size={24} color={colors.primary} style={{ marginRight: Spacing.sm }} />
                            <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>
                                Account
                            </Text>
                        </View>
                        <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>
                            Logged in as
                        </Text>
                        <Text style={[styles.emailText, { color: colors.text }]} numberOfLines={1}>
                            {user.email}
                        </Text>
                        <TouchableOpacity
                            style={[styles.logoutButton, { borderColor: colors.primary }]}
                            onPress={handleLogout}
                            accessibilityLabel="Log out of this account"
                            accessibilityRole="button"
                        >
                            <Ionicons name="log-out-outline" size={20} color={colors.primary} />
                            <Text style={[styles.logoutButtonText, { color: colors.primary }]}>
                                Log Out
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Danger Zone */}
                <View style={[styles.section, { backgroundColor: colors.surface }, Shadows.sm]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm }}>
                        <Ionicons name="warning-outline" size={24} color={colors.error} style={{ marginRight: Spacing.sm }} />
                        <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>
                            Data Management
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.dangerButton, { backgroundColor: colors.error + '15' }]}
                        onPress={handleClearData}
                        accessibilityLabel="Clear all app data"
                        accessibilityRole="button"
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
                            <Ionicons name="trash-outline" size={20} color={colors.error} />
                            <Text style={[styles.dangerButtonText, { color: colors.error }]}>
                                Clear All Data
                            </Text>
                        </View>
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
                        STEMM Labs v1.0.0
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
    confirmButton: {
        marginTop: Spacing.lg,
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
    },
    confirmButtonText: {
        fontSize: Typography.labelLarge.fontSize,
        fontWeight: '600',
    },
    emailText: {
        fontSize: Typography.bodyLarge.fontSize,
        fontWeight: '500',
        marginBottom: Spacing.lg,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        height: 48,
        borderRadius: BorderRadius.lg,
        borderWidth: 1.5,
    },
    logoutButtonText: {
        fontSize: Typography.labelLarge.fontSize,
        fontWeight: '600',
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
