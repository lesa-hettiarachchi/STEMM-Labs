/**
 * Results & Reflection Screen (Screen 9)
 * Shows calculated results from sensor data + formulas
 */

import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { getActivityById } from '@/constants/activities';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/theme';
import { useActivity } from '@/context/ActivityContext';
import { useSettings } from '@/context/SettingsContext';
import { useTeam } from '@/context/TeamContext';
import { calculateActivityResults, CalculationResult } from '@/services/calculations';
import { notifyActivityComplete } from '@/services/notifications';
import { saveAttemptLocal } from '@/services/database';

export default function ResultsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { resolvedTheme } = useSettings();
    const { activityProgress, team } = useTeam();
    const { session, clearSession } = useActivity();
    const colors = Colors[resolvedTheme];

    const activity = getActivityById(id);

    // All hooks must be called before any early return
    useEffect(() => {
        if (!activity || !session || !team) return;

        // Send completion notification
        notifyActivityComplete(activity.name).catch(console.warn);

        // Save attempt to SQLite (offline-first local storage)
        const attempt = {
            id: `${team.id}_${id}_${session.startedAt ?? Date.now()}`,
            teamId: team.id,
            activityId: id,
            iteration: activityProgress[id]?.currentIteration ?? 1,
            sensorReadings: session.sensorReadings,
            dataTableRows: session.dataTableRows,
            rating: session.rating,
            comment: session.comment ?? '',
            startedAt: session.startedAt ?? Date.now(),
            completedAt: Date.now(),
        };
        saveAttemptLocal(attempt).catch(console.warn);
    }, [activity?.name]);

    // Run calculations using session data
    const calculatedResults: CalculationResult[] = useMemo(() => {
        if (!activity) return [];
        const params = session?.calcParams ?? {};

        // For sound activity, extract dB readings
        const dbReadings =
            id === 'sound-pollution' && session?.sensorReadings
                ? session.sensorReadings.map((r) => r.value)
                : undefined;

        return calculateActivityResults(id, params, dbReadings);
    }, [id, session, activity]);

    if (!activity) return null;

    const progress = activityProgress[id];
    const currentIteration = progress?.currentIteration ?? 1;
    const canIterate = currentIteration < activity.maxIterations;
    const accentColor =
        activity.category === 'engineering' ? colors.engineering : colors.health;

    const handleReturnHome = () => {
        clearSession();
        router.replace('/(tabs)');
    };

    const handleIterate = () => {
        clearSession();
        router.push(`/activity/${id}/instructions`);
    };

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

                    {/* Calculated Results */}
                    <View style={[styles.section, { backgroundColor: colors.surface }, Shadows.sm]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            🧮 Calculated Results
                        </Text>
                        {calculatedResults.length > 0 ? (
                            calculatedResults.map((result, i) => (
                                <View key={i} style={[styles.resultRow, { borderBottomColor: colors.border }]}>
                                    <Text style={[styles.resultName, { color: colors.text }]}>
                                        {result.name}
                                    </Text>
                                    <View style={styles.resultValueRow}>
                                        <Text style={[styles.resultValue, { color: accentColor }]}>
                                            {result.value}
                                        </Text>
                                        <Text style={[styles.resultUnit, { color: colors.textSecondary }]}>
                                            {result.unit}
                                        </Text>
                                    </View>
                                    <Text style={[styles.resultFormula, { color: colors.textSecondary }]}>
                                        {result.formula}
                                    </Text>
                                </View>
                            ))
                        ) : (
                            activity.formulas.length > 0 ? (
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
                                    Record sensor data to see calculated results.
                                </Text>
                            )
                        )}
                    </View>

                    {/* Session Summary */}
                    {session && (
                        <View style={[styles.section, { backgroundColor: colors.surface }, Shadows.sm]}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                📊 Session Summary
                            </Text>
                            <View style={styles.summaryGrid}>
                                <SummaryItem
                                    label="Sensor Readings"
                                    value={`${session.sensorReadings.length}`}
                                    colors={colors}
                                    accentColor={accentColor}
                                />
                                <SummaryItem
                                    label="Data Rows"
                                    value={`${session.dataTableRows.length}`}
                                    colors={colors}
                                    accentColor={accentColor}
                                />
                                <SummaryItem
                                    label="Rating"
                                    value={session.rating > 0 ? `${'⭐'.repeat(session.rating)}` : '—'}
                                    colors={colors}
                                    accentColor={accentColor}
                                />
                                <SummaryItem
                                    label="Duration"
                                    value={session.startedAt ? `${Math.round((Date.now() - session.startedAt) / 60000)} min` : '—'}
                                    colors={colors}
                                    accentColor={accentColor}
                                />
                            </View>
                            {session.comment ? (
                                <View style={[styles.commentBox, { backgroundColor: colors.backgroundElement }]}>
                                    <Text style={[styles.commentLbl, { color: colors.textSecondary }]}>
                                        💬 Reflection
                                    </Text>
                                    <Text style={[styles.commentTxt, { color: colors.text }]}>
                                        {session.comment}
                                    </Text>
                                </View>
                            ) : null}
                        </View>
                    )}

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
                            onPress={handleIterate}
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
                            onPress={handleReturnHome}
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

function SummaryItem({
    label,
    value,
    colors,
    accentColor,
}: {
    label: string;
    value: string;
    colors: Record<string, string>;
    accentColor: string;
}) {
    return (
        <View style={[summaryStyles.item, { backgroundColor: colors.backgroundElement }]}>
            <Text style={[summaryStyles.label, { color: colors.textSecondary }]}>{label}</Text>
            <Text style={[summaryStyles.value, { color: accentColor }]}>{value}</Text>
        </View>
    );
}

const summaryStyles = StyleSheet.create({
    item: {
        flex: 1,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        minWidth: '45%',
    },
    label: { fontSize: Typography.labelSmall.fontSize, marginBottom: 2 },
    value: { fontSize: Typography.titleMedium.fontSize, fontWeight: '600' },
});

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
    resultRow: {
        paddingVertical: Spacing.md,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    resultName: {
        fontSize: Typography.labelLarge.fontSize,
        fontWeight: '600',
        marginBottom: Spacing.xxs,
    },
    resultValueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: Spacing.xs,
        marginBottom: Spacing.xxs,
    },
    resultValue: {
        fontSize: Typography.titleLarge.fontSize,
        fontWeight: '700',
    },
    resultUnit: {
        fontSize: Typography.bodyMedium.fontSize,
    },
    resultFormula: {
        fontSize: Typography.bodySmall.fontSize,
        fontFamily: 'monospace',
        marginTop: Spacing.xxs,
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
    summaryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    commentBox: {
        marginTop: Spacing.md,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
    },
    commentLbl: {
        fontSize: Typography.labelSmall.fontSize,
        marginBottom: Spacing.xxs,
    },
    commentTxt: {
        fontSize: Typography.bodyMedium.fontSize,
        lineHeight: 20,
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
