/**
 * Results & Reflection Screen (Screen 9)
 * Displays results summary, iteration comparison, and next actions
 */

import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { getActivityById } from '@/constants/activities';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/theme';
import { useSettings } from '@/context/SettingsContext';
import { useTeam } from '@/context/TeamContext';

export default function ResultsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { resolvedTheme } = useSettings();
    const { activityProgress } = useTeam();
    const colors = Colors[resolvedTheme];

    const activity = getActivityById(id);
    if (!activity) return null;

    const progress = activityProgress[id];
    const currentIteration = progress?.currentIteration ?? 1;
    const canIterate = currentIteration < activity.maxIterations;
    const accentColor =
        activity.category === 'engineering' ? colors.engineering : colors.health;

    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: 'Results',
                    headerStyle: { backgroundColor: colors.surface },
                    headerTintColor: colors.text,
                    headerRight: () => (
                        <TouchableOpacity
                            onPress={() => router.push('/help')}
                            accessibilityLabel="Help"
                            style={{ paddingLeft: 1.5, justifyContent: 'center', alignItems: 'center' }}
                        >
                            <Ionicons name="help-circle-outline" size={26} color={colors.text} />
                        </TouchableOpacity>
                    ),
                }}
            />
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Result Summary */}
                    <View
                        style={[
                            styles.summaryCard,
                            { backgroundColor: accentColor },
                        ]}
                    >
                        <Text style={styles.summaryIcon}>🎉</Text>
                        <Text style={styles.summaryTitle}>Activity Complete!</Text>
                        <Text style={styles.summarySubtitle}>
                            {activity.name} — Iteration {currentIteration}
                        </Text>
                    </View>

                    {/* Calculations Placeholder */}
                    <View style={[styles.section, { backgroundColor: colors.surface }, Shadows.sm]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            🧮 Calculated Results
                        </Text>
                        {activity.formulas.length > 0 ? (
                            activity.formulas.map((formula, i) => (
                                <View key={i} style={styles.formulaRow}>
                                    <Text style={[styles.formulaName, { color: colors.text }]}>
                                        {formula.name}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.formulaValue,
                                            { color: colors.textSecondary },
                                        ]}
                                    >
                                        {formula.formula}
                                    </Text>
                                    {formula.example && (
                                        <Text
                                            style={[
                                                styles.formulaExample,
                                                {
                                                    color: accentColor,
                                                    backgroundColor: accentColor + '10',
                                                },
                                            ]}
                                        >
                                            Example: {formula.example}
                                        </Text>
                                    )}
                                </View>
                            ))
                        ) : (
                            <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
                                Results are based on sensor measurements from your experiment.
                            </Text>
                        )}
                    </View>

                    {/* Write-Up Prompts */}
                    <View style={[styles.section, { backgroundColor: colors.surface }, Shadows.sm]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            ✏️ Write-Up Prompts (on paper)
                        </Text>
                        {activity.writeUp.prompts.map((prompt, i) => (
                            <View key={i} style={styles.promptRow}>
                                <Text style={[styles.promptNumber, { color: accentColor }]}>
                                    {i + 1}.
                                </Text>
                                <Text style={[styles.promptText, { color: colors.onSurface }]}>
                                    {prompt}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* Discussion */}
                    <View style={[styles.section, { backgroundColor: colors.surface }, Shadows.sm]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            💡 Discussion
                        </Text>
                        <Text style={[styles.bodyText, { color: colors.onSurface }]}>
                            {activity.discussion}
                        </Text>
                    </View>
                </ScrollView>

                {/* Bottom Actions */}
                <View style={[styles.bottomBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                    {/* Upload Evidence */}
                    <TouchableOpacity
                        style={[styles.outlineButton, { borderColor: accentColor }]}
                        onPress={() => router.push(`/activity/${id}/camera`)}
                        accessibilityLabel="Upload video evidence"
                        accessibilityRole="button"
                    >
                        <Text style={[styles.outlineButtonText, { color: accentColor }]}>
                            📹 Upload Evidence
                        </Text>
                    </TouchableOpacity>

                    {/* Iterate Again or Return Home */}
                    {canIterate ? (
                        <TouchableOpacity
                            style={[
                                styles.primaryButton,
                                { backgroundColor: accentColor },
                                Shadows.md,
                            ]}
                            onPress={() => router.push(`/activity/${id}/instructions`)}
                            accessibilityLabel="Iterate again"
                            accessibilityRole="button"
                        >
                            <Text style={styles.primaryButtonText}>
                                Iterate Again ({currentIteration + 1}/{activity.maxIterations})
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={[
                                styles.primaryButton,
                                { backgroundColor: colors.primary },
                                Shadows.md,
                            ]}
                            onPress={() => router.replace('/(tabs)')}
                            accessibilityLabel="Return to home screen"
                            accessibilityRole="button"
                        >
                            <Text style={styles.primaryButtonText}>Return to Home 🏠</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: Spacing.lg, paddingBottom: 140 },
    summaryCard: {
        borderRadius: BorderRadius.xl,
        padding: Spacing.xxl,
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    summaryIcon: { fontSize: 48, marginBottom: Spacing.sm },
    summaryTitle: {
        fontSize: Typography.headlineMedium.fontSize,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    summarySubtitle: {
        fontSize: Typography.bodyMedium.fontSize,
        color: 'rgba(255,255,255,0.8)',
        marginTop: Spacing.xs,
    },
    section: {
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
        marginBottom: Spacing.lg,
    },
    sectionTitle: {
        fontSize: Typography.titleMedium.fontSize,
        fontWeight: '600',
        marginBottom: Spacing.md,
    },
    bodyText: {
        fontSize: Typography.bodyLarge.fontSize,
        lineHeight: 24,
    },
    formulaRow: {
        marginBottom: Spacing.lg,
    },
    formulaName: {
        fontSize: Typography.labelLarge.fontSize,
        fontWeight: '600',
        marginBottom: Spacing.xxs,
    },
    formulaValue: {
        fontSize: Typography.bodyMedium.fontSize,
        fontFamily: 'monospace',
    },
    formulaExample: {
        fontSize: Typography.bodyMedium.fontSize,
        marginTop: Spacing.xs,
        padding: Spacing.sm,
        borderRadius: BorderRadius.sm,
        overflow: 'hidden',
    },
    promptRow: {
        flexDirection: 'row',
        marginBottom: Spacing.sm,
    },
    promptNumber: {
        fontSize: Typography.bodyLarge.fontSize,
        fontWeight: '600',
        marginRight: Spacing.sm,
        minWidth: 20,
    },
    promptText: {
        flex: 1,
        fontSize: Typography.bodyLarge.fontSize,
        lineHeight: 24,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: Spacing.lg,
        paddingBottom: Spacing.xxl,
        borderTopWidth: StyleSheet.hairlineWidth,
        gap: Spacing.sm,
    },
    outlineButton: {
        height: 48,
        borderRadius: BorderRadius.lg,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    outlineButtonText: {
        fontSize: Typography.labelLarge.fontSize,
        fontWeight: '600',
    },
    primaryButton: {
        height: 52,
        borderRadius: BorderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: Typography.labelLarge.fontSize,
        fontWeight: '700',
    },
});
