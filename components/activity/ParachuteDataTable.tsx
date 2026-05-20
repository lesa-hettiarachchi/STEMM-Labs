import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import {
    BorderRadius,
    Shadows,
    Spacing,
    Typography,
    type ThemeColors,
} from '@/constants/theme';
import type { DataTableRow } from '@/constants/types';

const DESIGN_COUNT = 3;

interface Props {
    rows: DataTableRow[];
    colors: ThemeColors;
    accentColor: string;
    onChange: (rows: DataTableRow[]) => void;
}

function makeDefaults(): DataTableRow[] {
    return [
        { action: 'No parachute (baseline)', predicted: '', actual: '', correct: '', slowmo: '' },
        { action: '', predicted: '', actual: '', correct: '', slowmo: '' },
        { action: '', predicted: '', actual: '', correct: '', slowmo: '' },
    ];
}

function deriveCorrect(predicted: string, actual: string): string {
    const p = parseFloat(predicted);
    const a = parseFloat(actual);
    if (isNaN(p) || isNaN(a)) return '';
    const diff = Math.abs(p - a);
    if (diff < 0.2) return 'Yes';
    if (diff < 0.5) return 'Close';
    return 'No';
}

export default function ParachuteDataTable({ rows, colors, accentColor, onChange }: Props) {
    // Always work with exactly DESIGN_COUNT rows, padding/initialising as needed
    const normalised: DataTableRow[] =
        rows && rows.length >= DESIGN_COUNT ? rows.slice(0, DESIGN_COUNT) : makeDefaults();

    const [timerRowIndex, setTimerRowIndex] = useState<number | null>(null);

    const updateCell = (rowIdx: number, key: string, value: string) => {
        const next = normalised.map((r, i) => (i === rowIdx ? { ...r, [key]: value } : r));
        // Auto-derive 'correct' when predicted or actual changes
        if (key === 'predicted' || key === 'actual') {
            next[rowIdx].correct = deriveCorrect(next[rowIdx].predicted ?? '', next[rowIdx].actual ?? '');
        }
        onChange(next);
    };

    const handleTimerStop = (elapsedMs: number) => {
        if (timerRowIndex === null) return;
        const seconds = (elapsedMs / 1000).toFixed(2);
        const next = normalised.map((r, i) =>
            i === timerRowIndex ? { ...r, actual: seconds, correct: deriveCorrect(r.predicted ?? '', seconds) } : r
        );
        onChange(next);
        setTimerRowIndex(null);
    };

    return (
        <View style={styles.container}>
            {normalised.map((row, i) => {
                const isComplete = !!(row.actual && row.predicted);
                return (
                    <View
                        key={i}
                        style={[
                            styles.row,
                            { backgroundColor: colors.surface, borderColor: colors.border },
                            isComplete && { borderColor: accentColor },
                        ]}
                    >
                        {/* Row header — design number + description input */}
                        <View style={styles.rowHeader}>
                            <View style={[styles.designBadge, { backgroundColor: accentColor }]}>
                                <Text style={styles.designBadgeText}>{i + 1}</Text>
                            </View>
                            <TextInput
                                style={[
                                    styles.designInput,
                                    { color: colors.text, borderBottomColor: colors.border },
                                ]}
                                value={row.action ?? ''}
                                onChangeText={(t) => updateCell(i, 'action', t)}
                                placeholder={
                                    i === 0 ? 'No parachute (baseline)' : `Describe design ${i + 1}…`
                                }
                                placeholderTextColor={colors.textSecondary}
                            />
                        </View>

                        {/* Fields grid: predicted | actual+timer | slow-mo | correct */}
                        <View style={styles.fieldsRow}>
                            <View style={styles.field}>
                                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                                    Predicted (s)
                                </Text>
                                <TextInput
                                    style={[
                                        styles.fieldInput,
                                        {
                                            backgroundColor: colors.backgroundElement,
                                            color: colors.text,
                                            borderColor: colors.border,
                                        },
                                    ]}
                                    keyboardType="decimal-pad"
                                    value={row.predicted ?? ''}
                                    onChangeText={(t) => updateCell(i, 'predicted', t)}
                                    placeholder="0.5"
                                    placeholderTextColor={colors.textSecondary}
                                />
                            </View>

                            <View style={styles.field}>
                                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                                    Actual (s)
                                </Text>
                                <View style={styles.actualRow}>
                                    <TextInput
                                        style={[
                                            styles.fieldInput,
                                            styles.actualInput,
                                            {
                                                backgroundColor: colors.backgroundElement,
                                                color: colors.text,
                                                borderColor: colors.border,
                                            },
                                        ]}
                                        keyboardType="decimal-pad"
                                        value={row.actual ?? ''}
                                        onChangeText={(t) => updateCell(i, 'actual', t)}
                                        placeholder="—"
                                        placeholderTextColor={colors.textSecondary}
                                    />
                                    <TouchableOpacity
                                        style={[styles.timerBtn, { backgroundColor: accentColor }]}
                                        onPress={() => setTimerRowIndex(i)}
                                        accessibilityLabel={`Run timer for design ${i + 1}`}
                                    >
                                        <Ionicons name="stopwatch-outline" size={20} color="#FFFFFF" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.field}>
                                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                                    Slow-mo contact (s)
                                </Text>
                                <TextInput
                                    style={[
                                        styles.fieldInput,
                                        {
                                            backgroundColor: colors.backgroundElement,
                                            color: colors.text,
                                            borderColor: colors.border,
                                        },
                                    ]}
                                    keyboardType="decimal-pad"
                                    value={row.slowmo ?? ''}
                                    onChangeText={(t) => updateCell(i, 'slowmo', t)}
                                    placeholder="0.05"
                                    placeholderTextColor={colors.textSecondary}
                                />
                            </View>

                            <View style={styles.field}>
                                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                                    Right?
                                </Text>
                                <View
                                    style={[
                                        styles.derivedBox,
                                        { backgroundColor: colors.backgroundElement },
                                    ]}
                                >
                                    <Text style={[styles.derivedText, { color: colors.text }]}>
                                        {row.correct || '—'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                );
            })}

            <TimerModal
                visible={timerRowIndex !== null}
                designLabel={
                    timerRowIndex !== null
                        ? normalised[timerRowIndex].action || `Design ${timerRowIndex + 1}`
                        : ''
                }
                colors={colors}
                accentColor={accentColor}
                onCancel={() => setTimerRowIndex(null)}
                onStop={handleTimerStop}
            />
        </View>
    );
}

// ─── Inline stopwatch modal ─────────────────────────────────────

function TimerModal({
    visible,
    designLabel,
    colors,
    accentColor,
    onCancel,
    onStop,
}: {
    visible: boolean;
    designLabel: string;
    colors: ThemeColors;
    accentColor: string;
    onCancel: () => void;
    onStop: (elapsedMs: number) => void;
}) {
    const [elapsedMs, setElapsedMs] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [hasResult, setHasResult] = useState(false);
    const startRef = useRef<number>(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Reset state whenever modal closes
    useEffect(() => {
        if (!visible) {
            setElapsedMs(0);
            setIsRunning(false);
            setHasResult(false);
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
    }, [visible]);

    const handleStart = () => {
        setHasResult(false);
        setElapsedMs(0);
        startRef.current = Date.now();
        setIsRunning(true);
        intervalRef.current = setInterval(() => {
            setElapsedMs(Date.now() - startRef.current);
        }, 10);
    };

    const handleStop = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        const final = Date.now() - startRef.current;
        setIsRunning(false);
        setElapsedMs(final);
        setHasResult(true);
    };

    const handleConfirm = () => onStop(elapsedMs);

    const handleRetry = () => {
        setHasResult(false);
        setElapsedMs(0);
    };

    const seconds = (elapsedMs / 1000).toFixed(2);

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent
            statusBarTranslucent
            onRequestClose={onCancel}
        >
            <View style={styles.modalBg}>
                <View style={[styles.modalCard, { backgroundColor: colors.surface }, Shadows.lg]}>
                    <Text style={[styles.modalKicker, { color: colors.textSecondary }]}>
                        Timing
                    </Text>
                    <Text style={[styles.modalDesign, { color: colors.text }]} numberOfLines={2}>
                        {designLabel}
                    </Text>
                    <Text style={[styles.modalTime, { color: accentColor }]}>{seconds}s</Text>

                    <View style={styles.modalActions}>
                        {!isRunning && !hasResult && (
                            <TouchableOpacity
                                style={[styles.modalBtnPrimary, { backgroundColor: accentColor }]}
                                onPress={handleStart}
                            >
                                <Ionicons name="play" size={20} color="#FFFFFF" />
                                <Text style={styles.modalBtnPrimaryText}>Start (drop now)</Text>
                            </TouchableOpacity>
                        )}
                        {isRunning && (
                            <TouchableOpacity
                                style={[styles.modalBtnPrimary, { backgroundColor: '#EF4444' }]}
                                onPress={handleStop}
                            >
                                <Ionicons name="stop" size={20} color="#FFFFFF" />
                                <Text style={styles.modalBtnPrimaryText}>Stop (toy landed)</Text>
                            </TouchableOpacity>
                        )}
                        {hasResult && (
                            <>
                                <TouchableOpacity
                                    style={[styles.modalBtnPrimary, { backgroundColor: accentColor }]}
                                    onPress={handleConfirm}
                                >
                                    <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                                    <Text style={styles.modalBtnPrimaryText}>Use this time</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalBtnGhost, { borderColor: colors.border }]}
                                    onPress={handleRetry}
                                >
                                    <Text style={[styles.modalBtnGhostText, { color: colors.text }]}>
                                        Try again
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>

                    <TouchableOpacity onPress={onCancel} style={styles.modalCancel}>
                        <Text style={[styles.modalCancelText, { color: colors.textSecondary }]}>
                            Cancel
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: { width: '100%', gap: Spacing.md },
    row: {
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        padding: Spacing.md,
    },
    rowHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    designBadge: {
        width: 28,
        height: 28,
        borderRadius: BorderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
    },
    designBadgeText: {
        color: '#FFFFFF',
        fontSize: Typography.labelLarge.fontSize,
        fontWeight: '700',
    },
    designInput: {
        flex: 1,
        height: 40,
        fontSize: Typography.bodyLarge.fontSize,
        borderBottomWidth: 1,
        paddingHorizontal: Spacing.xxs,
    },
    fieldsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    field: { width: '48%' },
    fieldLabel: {
        fontSize: Typography.labelSmall.fontSize,
        marginBottom: Spacing.xs,
    },
    fieldInput: {
        height: 40,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        paddingHorizontal: Spacing.sm,
        fontSize: Typography.bodyMedium.fontSize,
    },
    actualRow: {
        flexDirection: 'row',
        gap: Spacing.xs,
        alignItems: 'center',
    },
    actualInput: { flex: 1 },
    timerBtn: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    derivedBox: {
        height: 40,
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    derivedText: {
        fontSize: Typography.bodyMedium.fontSize,
        fontWeight: '600',
    },

    // Modal
    modalBg: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    modalCard: {
        width: '100%',
        maxWidth: 360,
        borderRadius: BorderRadius.xl,
        padding: Spacing.xxl,
        alignItems: 'center',
    },
    modalKicker: {
        fontSize: Typography.labelSmall.fontSize,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    modalDesign: {
        fontSize: Typography.titleMedium.fontSize,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: Spacing.xxs,
    },
    modalTime: {
        fontSize: 64,
        fontWeight: '700',
        fontVariant: ['tabular-nums'],
        marginVertical: Spacing.xl,
    },
    modalActions: { width: '100%', gap: Spacing.sm },
    modalBtnPrimary: {
        height: 52,
        borderRadius: BorderRadius.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.xs,
    },
    modalBtnPrimaryText: {
        color: '#FFFFFF',
        fontSize: Typography.labelLarge.fontSize,
        fontWeight: '700',
    },
    modalBtnGhost: {
        height: 44,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalBtnGhostText: {
        fontSize: Typography.labelLarge.fontSize,
        fontWeight: '600',
    },
    modalCancel: { marginTop: Spacing.md },
    modalCancelText: { fontSize: Typography.bodyMedium.fontSize },
});
