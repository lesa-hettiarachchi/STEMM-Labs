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
import {
    calculateActivityResults,
    calculateEarthquakeRowResults,
    calculateHandFanRowResults,
    calculateParachuteRowResults,
    CalculationResult,
    HAND_FAN_MATERIALS,
} from '@/services/calculations';
import { notifyActivityComplete } from '@/services/notifications';
import type { DataTableRow } from '@/constants/types';

export default function ResultsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { resolvedTheme } = useSettings();
    const { activityProgress, team } = useTeam();
    const { session, clearSession } = useActivity();
    const colors = Colors[resolvedTheme];

    const activity = getActivityById(id);

    // SQLite save now happens inside saveSession (ActivityContext) — this hook
    // is just for firing the completion notification.
    useEffect(() => {
        if (activity) {
            notifyActivityComplete(activity.name).catch(console.warn);
        }
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
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => {
                                clearSession();
                                router.replace('/(tabs)');
                            }}
                            accessibilityLabel="Return home"
                            style={{ paddingHorizontal: 4 }}
                        >
                            <Ionicons name="arrow-back" size={26} color={colors.text} />
                        </TouchableOpacity>
                    ),
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
                        <Ionicons name="checkmark-circle-outline" size={48} color="#FFFFFF" style={{ marginBottom: Spacing.sm }} />
                        <Text style={styles.summaryTitle}>Activity Complete</Text>
                        <Text style={styles.summarySubtitle}>
                            {activity.name} — Iteration {currentIteration}
                        </Text>
                    </View>

                    {/* Parachute: side-by-side design comparison */}
                    {id === 'parachute-drop' && (
                        <ParachuteComparison
                            rows={session?.dataTableRows ?? []}
                            distance={session?.calcParams.distance ?? 0}
                            mass={session?.calcParams.mass ?? 0}
                            colors={colors}
                            accentColor={accentColor}
                        />
                    )}

                    {/* Hand Fan: side-by-side design comparison */}
                    {id === 'hand-fan' && (
                        <HandFanComparison
                            rows={session?.dataTableRows ?? []}
                            colors={colors}
                            accentColor={accentColor}
                        />
                    )}

                    {/* Earthquake: side-by-side design comparison */}
                    {id === 'earthquake-structure' && (
                        <EarthquakeComparison
                            rows={session?.dataTableRows ?? []}
                            colors={colors}
                            accentColor={accentColor}
                        />
                    )}

                    {/* Calculated Results — generic activities only */}
                    {id !== 'parachute-drop' && id !== 'hand-fan' && id !== 'earthquake-structure' && (
                    <View style={[styles.section, { backgroundColor: colors.surface }, Shadows.sm]}>
                        <View style={styles.sectionTitleRow}>
                            <Ionicons name="calculator-outline" size={18} color={colors.text} />
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                Calculated Results
                            </Text>
                        </View>
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
                    )}

                    {/* Session Summary */}
                    {session && (
                        <View style={[styles.section, { backgroundColor: colors.surface }, Shadows.sm]}>
                            <View style={styles.sectionTitleRow}>
                                <Ionicons name="stats-chart-outline" size={18} color={colors.text} />
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                    Session Summary
                                </Text>
                            </View>
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
                                    value={session.rating > 0 ? `${session.rating}/5` : '—'}
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
                                    <View style={styles.commentLblRow}>
                                        <Ionicons name="chatbox-outline" size={14} color={colors.textSecondary} />
                                        <Text style={[styles.commentLbl, { color: colors.textSecondary }]}>
                                            Reflection
                                        </Text>
                                    </View>
                                    <Text style={[styles.commentTxt, { color: colors.text }]}>
                                        {session.comment}
                                    </Text>
                                </View>
                            ) : null}
                        </View>
                    )}

                    {/* Write-Up Prompts */}
                    <View style={[styles.section, { backgroundColor: colors.surface }, Shadows.sm]}>
                        <View style={styles.sectionTitleRow}>
                            <Ionicons name="create-outline" size={18} color={colors.text} />
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                Write-Up Prompts (on paper)
                            </Text>
                        </View>
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
                        <View style={styles.sectionTitleRow}>
                            <Ionicons name="bulb-outline" size={18} color={colors.text} />
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                Discussion
                            </Text>
                        </View>
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
                        <Ionicons name="videocam-outline" size={18} color={accentColor} />
                        <Text style={[styles.outlineButtonText, { color: accentColor }]}>
                            Upload Evidence
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
                            <Text style={styles.primaryButtonText}>Return to Home</Text>
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

function ParachuteComparison({
    rows,
    distance,
    mass,
    colors,
    accentColor,
}: {
    rows: DataTableRow[];
    distance: number;
    mass: number;
    colors: Record<string, string>;
    accentColor: string;
}) {
    type Computed = {
        idx: number;
        name: string;
        dropTime: number;
        results: CalculationResult[];
    };

    const computed: Computed[] = rows
        .map((row, idx) => {
            const dropTime = parseFloat(row.actual ?? '');
            const contactTime = parseFloat(row.slowmo ?? '');
            if (!Number.isFinite(dropTime) || dropTime <= 0) return null;
            return {
                idx,
                name: row.action?.trim() || `Design ${idx + 1}`,
                dropTime,
                results: calculateParachuteRowResults(
                    distance,
                    mass,
                    dropTime,
                    Number.isFinite(contactTime) ? contactTime : 0
                ),
            };
        })
        .filter((c): c is Computed => c !== null);

    if (computed.length === 0) {
        return (
            <View style={[parachuteStyles.empty, { backgroundColor: colors.surface }, Shadows.sm]}>
                <Ionicons name="time-outline" size={32} color={colors.textSecondary} />
                <Text style={[parachuteStyles.emptyText, { color: colors.textSecondary }]}>
                    No drop times recorded yet.  Go back and use the per-row timer
                    on each design to capture drop times.
                </Text>
            </View>
        );
    }

    const setupComplete = distance > 0 && mass > 0;
    const bestIdx = computed.reduce((best, c) => (c.dropTime > best.dropTime ? c : best), computed[0]).idx;

    return (
        <View style={[parachuteStyles.section, { backgroundColor: colors.surface }, Shadows.sm]}>
            <View style={parachuteStyles.titleRow}>
                <Ionicons name="layers-outline" size={18} color={colors.text} />
                <Text style={[parachuteStyles.title, { color: colors.text }]}>
                    Design Comparison
                </Text>
            </View>

            {!setupComplete && (
                <Text style={[parachuteStyles.warn, { color: '#EF4444' }]}>
                    Setup is incomplete — drop height and toy mass were not entered,
                    so physics calculations cannot be computed.
                </Text>
            )}

            {setupComplete && (
                <Text style={[parachuteStyles.setupLine, { color: colors.textSecondary }]}>
                    Drop height: {distance.toFixed(2)} m · Toy mass: {mass.toFixed(3)} kg
                </Text>
            )}

            {computed.map((c) => {
                const isBest = c.idx === bestIdx && computed.length > 1;
                return (
                    <View
                        key={c.idx}
                        style={[
                            parachuteStyles.designCard,
                            { backgroundColor: colors.backgroundElement },
                            isBest && {
                                borderColor: accentColor,
                                borderWidth: 2,
                                backgroundColor: accentColor + '12',
                            },
                        ]}
                    >
                        <View style={parachuteStyles.designHeader}>
                            <View style={[parachuteStyles.designBadge, { backgroundColor: accentColor }]}>
                                <Text style={parachuteStyles.designBadgeText}>{c.idx + 1}</Text>
                            </View>
                            <Text
                                style={[parachuteStyles.designName, { color: colors.text }]}
                                numberOfLines={2}
                            >
                                {c.name}
                            </Text>
                            {isBest && (
                                <View style={[parachuteStyles.bestPill, { backgroundColor: accentColor }]}>
                                    <Ionicons name="trophy-outline" size={12} color="#FFFFFF" />
                                    <Text style={parachuteStyles.bestPillText}>Best</Text>
                                </View>
                            )}
                        </View>

                        <View style={parachuteStyles.metricsGrid}>
                            <View style={parachuteStyles.metric}>
                                <Text style={[parachuteStyles.metricLabel, { color: colors.textSecondary }]}>
                                    Drop Time
                                </Text>
                                <Text style={[parachuteStyles.metricValue, { color: accentColor }]}>
                                    {c.dropTime.toFixed(2)}
                                </Text>
                                <Text style={[parachuteStyles.metricUnit, { color: colors.textSecondary }]}>
                                    s
                                </Text>
                            </View>
                            {c.results.map((r) => (
                                <View key={r.name} style={parachuteStyles.metric}>
                                    <Text
                                        style={[parachuteStyles.metricLabel, { color: colors.textSecondary }]}
                                        numberOfLines={1}
                                    >
                                        {r.name}
                                    </Text>
                                    <Text style={[parachuteStyles.metricValue, { color: colors.text }]}>
                                        {r.value}
                                    </Text>
                                    <Text style={[parachuteStyles.metricUnit, { color: colors.textSecondary }]}>
                                        {r.unit}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                );
            })}
        </View>
    );
}

const parachuteStyles = StyleSheet.create({
    section: {
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
        marginBottom: Spacing.lg,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        marginBottom: Spacing.sm,
    },
    title: { fontSize: Typography.titleMedium.fontSize, fontWeight: '600' },
    setupLine: {
        fontSize: Typography.bodySmall.fontSize,
        marginBottom: Spacing.lg,
    },
    warn: {
        fontSize: Typography.bodySmall.fontSize,
        marginBottom: Spacing.lg,
        fontStyle: 'italic',
    },
    empty: {
        borderRadius: BorderRadius.xl,
        padding: Spacing.xxl,
        marginBottom: Spacing.lg,
        alignItems: 'center',
        gap: Spacing.sm,
    },
    emptyText: {
        fontSize: Typography.bodyMedium.fontSize,
        textAlign: 'center',
        lineHeight: 20,
    },
    designCard: {
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
    },
    designHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    designBadge: {
        width: 24,
        height: 24,
        borderRadius: BorderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
    },
    designBadgeText: {
        color: '#FFFFFF',
        fontSize: Typography.labelSmall.fontSize,
        fontWeight: '700',
    },
    designName: {
        flex: 1,
        fontSize: Typography.titleMedium.fontSize,
        fontWeight: '600',
    },
    bestPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 3,
        borderRadius: BorderRadius.full,
    },
    bestPillText: {
        color: '#FFFFFF',
        fontSize: Typography.labelSmall.fontSize,
        fontWeight: '700',
    },
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
    },
    metric: {
        width: '46%',
    },
    metricLabel: {
        fontSize: Typography.labelSmall.fontSize,
        marginBottom: 2,
    },
    metricValue: {
        fontSize: Typography.titleMedium.fontSize,
        fontWeight: '700',
        fontVariant: ['tabular-nums'],
    },
    metricUnit: {
        fontSize: Typography.labelSmall.fontSize,
    },
});

// ─── Hand Fan Comparison ─────────────────────────────────────────
// Same idea as ParachuteComparison.  Shows each of the 3 fan designs
// with their material, distance, predicted vs actual angle, and the
// computed estimated force.  Best = largest measured bend angle.

function HandFanComparison({
    rows,
    colors,
    accentColor,
}: {
    rows: DataTableRow[];
    colors: Record<string, string>;
    accentColor: string;
}) {
    type Computed = {
        idx: number;
        name: string;
        material: string;
        distance: string;
        angleDeg: number;
        results: CalculationResult[];
    };

    const computed: Computed[] = rows
        .map((row, idx) => {
            const angle = parseFloat(row.outcome ?? '');
            if (!Number.isFinite(angle) || angle <= 0) return null;
            const material = (row.material ?? 'paper') as string;
            return {
                idx,
                name: row.design?.trim() || `Design ${idx + 1}`,
                material,
                distance: row.distance ?? '30',
                angleDeg: angle,
                results: calculateHandFanRowResults(material, angle),
            };
        })
        .filter((c): c is Computed => c !== null);

    if (computed.length === 0) {
        return (
            <View style={[parachuteStyles.empty, { backgroundColor: colors.surface }, Shadows.sm]}>
                <Ionicons name="speedometer-outline" size={32} color={colors.textSecondary} />
                <Text style={[parachuteStyles.emptyText, { color: colors.textSecondary }]}>
                    No bend angles recorded yet.  Go back and use the per-row
                    sensor measure button on each design.
                </Text>
            </View>
        );
    }

    const bestIdx = computed.reduce((best, c) => (c.angleDeg > best.angleDeg ? c : best), computed[0]).idx;

    return (
        <View style={[parachuteStyles.section, { backgroundColor: colors.surface }, Shadows.sm]}>
            <View style={parachuteStyles.titleRow}>
                <Ionicons name="layers-outline" size={18} color={colors.text} />
                <Text style={[parachuteStyles.title, { color: colors.text }]}>
                    Design Comparison
                </Text>
            </View>

            {computed.map((c) => {
                const isBest = c.idx === bestIdx && computed.length > 1;
                const materialLabel =
                    (HAND_FAN_MATERIALS as Record<string, { label: string; k: number }>)[c.material]?.label ?? c.material;
                return (
                    <View
                        key={c.idx}
                        style={[
                            parachuteStyles.designCard,
                            { backgroundColor: colors.backgroundElement },
                            isBest && {
                                borderColor: accentColor,
                                borderWidth: 2,
                                backgroundColor: accentColor + '12',
                            },
                        ]}
                    >
                        <View style={parachuteStyles.designHeader}>
                            <View style={[parachuteStyles.designBadge, { backgroundColor: accentColor }]}>
                                <Text style={parachuteStyles.designBadgeText}>{c.idx + 1}</Text>
                            </View>
                            <Text
                                style={[parachuteStyles.designName, { color: colors.text }]}
                                numberOfLines={2}
                            >
                                {c.name}
                            </Text>
                            {isBest && (
                                <View style={[parachuteStyles.bestPill, { backgroundColor: accentColor }]}>
                                    <Ionicons name="trophy-outline" size={12} color="#FFFFFF" />
                                    <Text style={parachuteStyles.bestPillText}>Most Bend</Text>
                                </View>
                            )}
                        </View>

                        <Text style={[parachuteStyles.setupLine, { color: colors.textSecondary }]}>
                            {materialLabel} · Fan at {c.distance} cm
                        </Text>

                        <View style={parachuteStyles.metricsGrid}>
                            <View style={parachuteStyles.metric}>
                                <Text style={[parachuteStyles.metricLabel, { color: colors.textSecondary }]}>
                                    Bend Angle
                                </Text>
                                <Text style={[parachuteStyles.metricValue, { color: accentColor }]}>
                                    {c.angleDeg.toFixed(1)}
                                </Text>
                                <Text style={[parachuteStyles.metricUnit, { color: colors.textSecondary }]}>
                                    °
                                </Text>
                            </View>
                            {c.results.map((r) => (
                                <View key={r.name} style={parachuteStyles.metric}>
                                    <Text
                                        style={[parachuteStyles.metricLabel, { color: colors.textSecondary }]}
                                        numberOfLines={1}
                                    >
                                        {r.name}
                                    </Text>
                                    <Text style={[parachuteStyles.metricValue, { color: colors.text }]}>
                                        {r.value}
                                    </Text>
                                    <Text style={[parachuteStyles.metricUnit, { color: colors.textSecondary }]}>
                                        {r.unit}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                );
            })}
        </View>
    );
}

// ─── Earthquake Comparison ───────────────────────────────────────
// Lower vibration amplitude = more stable structure.  Best row =
// smallest amplitude, highlighted with the accent border + trophy pill.

function EarthquakeComparison({
    rows,
    colors,
    accentColor,
}: {
    rows: DataTableRow[];
    colors: Record<string, string>;
    accentColor: string;
}) {
    type Computed = {
        idx: number;
        name: string;
        amplitudeMm: number;
        results: CalculationResult[];
    };

    const computed: Computed[] = rows
        .map((row, idx) => {
            const amp = parseFloat(row.outcome ?? '');
            if (!Number.isFinite(amp) || amp < 0) return null;
            return {
                idx,
                name: row.design?.trim() || `Design ${idx + 1}`,
                amplitudeMm: amp,
                results: calculateEarthquakeRowResults(amp),
            };
        })
        .filter((c): c is Computed => c !== null);

    if (computed.length === 0) {
        return (
            <View style={[parachuteStyles.empty, { backgroundColor: colors.surface }, Shadows.sm]}>
                <Ionicons name="pulse-outline" size={32} color={colors.textSecondary} />
                <Text style={[parachuteStyles.emptyText, { color: colors.textSecondary }]}>
                    No vibration measurements recorded yet.  Go back and use the
                    per-row sensor on each design.
                </Text>
            </View>
        );
    }

    // Best = LOWEST amplitude (most stable)
    const bestIdx = computed.reduce(
        (best, c) => (c.amplitudeMm < best.amplitudeMm ? c : best),
        computed[0]
    ).idx;

    return (
        <View style={[parachuteStyles.section, { backgroundColor: colors.surface }, Shadows.sm]}>
            <View style={parachuteStyles.titleRow}>
                <Ionicons name="layers-outline" size={18} color={colors.text} />
                <Text style={[parachuteStyles.title, { color: colors.text }]}>
                    Design Comparison
                </Text>
            </View>
            <Text style={[parachuteStyles.setupLine, { color: colors.textSecondary }]}>
                Smallest vibration = most stable structure
            </Text>

            {computed.map((c) => {
                const isBest = c.idx === bestIdx && computed.length > 1;
                return (
                    <View
                        key={c.idx}
                        style={[
                            parachuteStyles.designCard,
                            { backgroundColor: colors.backgroundElement },
                            isBest && {
                                borderColor: accentColor,
                                borderWidth: 2,
                                backgroundColor: accentColor + '12',
                            },
                        ]}
                    >
                        <View style={parachuteStyles.designHeader}>
                            <View style={[parachuteStyles.designBadge, { backgroundColor: accentColor }]}>
                                <Text style={parachuteStyles.designBadgeText}>{c.idx + 1}</Text>
                            </View>
                            <Text
                                style={[parachuteStyles.designName, { color: colors.text }]}
                                numberOfLines={2}
                            >
                                {c.name}
                            </Text>
                            {isBest && (
                                <View style={[parachuteStyles.bestPill, { backgroundColor: accentColor }]}>
                                    <Ionicons name="trophy-outline" size={12} color="#FFFFFF" />
                                    <Text style={parachuteStyles.bestPillText}>Most Stable</Text>
                                </View>
                            )}
                        </View>

                        <View style={parachuteStyles.metricsGrid}>
                            {c.results.map((r) => (
                                <View key={r.name} style={parachuteStyles.metric}>
                                    <Text
                                        style={[parachuteStyles.metricLabel, { color: colors.textSecondary }]}
                                        numberOfLines={1}
                                    >
                                        {r.name}
                                    </Text>
                                    <Text
                                        style={[
                                            parachuteStyles.metricValue,
                                            { color: r.name === 'Peak Amplitude' ? accentColor : colors.text },
                                        ]}
                                    >
                                        {r.value}
                                    </Text>
                                    <Text style={[parachuteStyles.metricUnit, { color: colors.textSecondary }]}>
                                        {r.unit}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                );
            })}
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
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        marginBottom: Spacing.md,
    },
    sectionTitle: {
        fontSize: Typography.titleMedium.fontSize,
        fontWeight: '600',
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
    commentLblRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xxs,
        marginBottom: Spacing.xxs,
    },
    commentLbl: {
        fontSize: Typography.labelSmall.fontSize,
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
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: Spacing.xs,
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
