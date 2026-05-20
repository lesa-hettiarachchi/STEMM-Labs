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
import { createAccelerometerService } from '@/services/sensors/accelerometer';

const DESIGN_COUNT = 3;

interface Props {
    rows: DataTableRow[];
    colors: ThemeColors;
    accentColor: string;
    onChange: (rows: DataTableRow[]) => void;
}

function makeDefaults(): DataTableRow[] {
    return [
        { design: '4 folds + 4 pillars', predicted: '', outcome: '', correct: '' },
        { design: '', predicted: '', outcome: '', correct: '' },
        { design: '', predicted: '', outcome: '', correct: '' },
    ];
}

function deriveCorrect(predicted: string, actual: string): string {
    const p = parseFloat(predicted);
    const a = parseFloat(actual);
    if (isNaN(p) || isNaN(a)) return '';
    const diff = Math.abs(p - a);
    if (diff < 1) return 'Yes';
    if (diff < 3) return 'Close';
    return 'No';
}

function stabilityFromAmplitude(amplitudeMm: number): number {
    return Math.max(0, Math.min(100, Math.round(100 - amplitudeMm * 10)));
}

export default function EarthquakeDataTable({ rows, colors, accentColor, onChange }: Props) {
    const normalised: DataTableRow[] =
        rows && rows.length >= DESIGN_COUNT ? rows.slice(0, DESIGN_COUNT) : makeDefaults();

    const [measureRowIndex, setMeasureRowIndex] = useState<number | null>(null);

    const updateCell = (rowIdx: number, key: string, value: string) => {
        const next = normalised.map((r, i) => (i === rowIdx ? { ...r, [key]: value } : r));
        if (key === 'predicted' || key === 'outcome') {
            next[rowIdx].correct = deriveCorrect(
                next[rowIdx].predicted ?? '',
                next[rowIdx].outcome ?? ''
            );
        }
        onChange(next);
    };

    const handleAmplitudeCaptured = (amplitudeMm: number) => {
        if (measureRowIndex === null) return;
        const value = amplitudeMm.toFixed(1);
        const next = normalised.map((r, i) =>
            i === measureRowIndex
                ? { ...r, outcome: value, correct: deriveCorrect(r.predicted ?? '', value) }
                : r
        );
        onChange(next);
        setMeasureRowIndex(null);
    };

    return (
        <View style={styles.container}>
            {normalised.map((row, i) => {
                const amplitude = parseFloat(row.outcome ?? '');
                const stability =
                    !isNaN(amplitude) && amplitude >= 0 ? stabilityFromAmplitude(amplitude) : null;
                const isComplete = !!(row.outcome && row.predicted);

                return (
                    <View
                        key={i}
                        style={[
                            styles.row,
                            { backgroundColor: colors.surface, borderColor: colors.border },
                            isComplete && { borderColor: accentColor },
                        ]}
                    >
                        {/* Row header */}
                        <View style={styles.rowHeader}>
                            <View style={[styles.designBadge, { backgroundColor: accentColor }]}>
                                <Text style={styles.designBadgeText}>{i + 1}</Text>
                            </View>
                            <TextInput
                                style={[styles.designInput, { color: colors.text, borderBottomColor: colors.border }]}
                                value={row.design ?? ''}
                                onChangeText={(t) => updateCell(i, 'design', t)}
                                placeholder={`e.g. ${i === 0 ? '4 folds + 4 pillars' : '10 folds + 4 pillars'}`}
                                placeholderTextColor={colors.textSecondary}
                            />
                        </View>

                        {/* Predicted + Actual */}
                        <View style={styles.fieldsRow}>
                            <View style={styles.field}>
                                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                                    Predicted (mm)
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
                                    placeholder="2"
                                    placeholderTextColor={colors.textSecondary}
                                />
                            </View>

                            <View style={styles.field}>
                                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                                    Actual (mm)
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
                                        value={row.outcome ?? ''}
                                        onChangeText={(t) => updateCell(i, 'outcome', t)}
                                        placeholder="—"
                                        placeholderTextColor={colors.textSecondary}
                                    />
                                    <TouchableOpacity
                                        style={[styles.measureBtn, { backgroundColor: accentColor }]}
                                        onPress={() => setMeasureRowIndex(i)}
                                        accessibilityLabel={`Measure vibration for design ${i + 1}`}
                                    >
                                        <Ionicons name="pulse-outline" size={20} color="#FFFFFF" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        {/* Right? + Stability */}
                        <View style={styles.fieldsRow}>
                            <View style={styles.field}>
                                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                                    Right?
                                </Text>
                                <View style={[styles.derivedBox, { backgroundColor: colors.backgroundElement }]}>
                                    <Text style={[styles.derivedText, { color: colors.text }]}>
                                        {row.correct || '—'}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.field}>
                                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                                    Stability
                                </Text>
                                <View style={[styles.derivedBox, { backgroundColor: colors.backgroundElement }]}>
                                    <Text style={[styles.derivedText, { color: accentColor }]}>
                                        {stability !== null ? `${stability}/100` : '—'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                );
            })}

            <VibrationMeasureModal
                visible={measureRowIndex !== null}
                designLabel={
                    measureRowIndex !== null
                        ? normalised[measureRowIndex].design || `Design ${measureRowIndex + 1}`
                        : ''
                }
                colors={colors}
                accentColor={accentColor}
                onCancel={() => setMeasureRowIndex(null)}
                onCapture={handleAmplitudeCaptured}
            />
        </View>
    );
}

// ─── Vibration measurement modal ─────────────────────────────────

function VibrationMeasureModal({
    visible,
    designLabel,
    colors,
    accentColor,
    onCancel,
    onCapture,
}: {
    visible: boolean;
    designLabel: string;
    colors: ThemeColors;
    accentColor: string;
    onCancel: () => void;
    onCapture: (amplitudeMm: number) => void;
}) {
    const accelRef = useRef(createAccelerometerService());
    const [currentAmp, setCurrentAmp] = useState(0);
    const [peakAmp, setPeakAmp] = useState(0);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        if (!visible) return;
        setCurrentAmp(0);
        setPeakAmp(0);
        setIsRunning(false);
        accelRef.current.clearReadings();
        return () => {
            accelRef.current.cleanup();
            accelRef.current = createAccelerometerService();
        };
    }, [visible]);

    const handleStart = async () => {
        try {
            await accelRef.current.start(80);
            accelRef.current.setOnReading((reading) => {
                const amp = reading.vibrationAmplitudeMm;
                setCurrentAmp(amp);
                setPeakAmp((prev) => (amp > prev ? amp : prev));
            });
            setIsRunning(true);
        } catch (err) {
            console.warn('Accelerometer start failed:', err);
        }
    };

    const handleStop = () => {
        accelRef.current.stop();
        setIsRunning(false);
    };

    const handleConfirm = () => {
        accelRef.current.stop();
        onCapture(peakAmp);
    };

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
                        Measuring Vibration
                    </Text>
                    <Text style={[styles.modalDesign, { color: colors.text }]} numberOfLines={2}>
                        {designLabel}
                    </Text>

                    <Text style={[styles.modalAmp, { color: accentColor }]}>
                        {currentAmp.toFixed(1)} mm
                    </Text>
                    <Text style={[styles.modalPeak, { color: colors.textSecondary }]}>
                        Peak observed: {peakAmp.toFixed(1)} mm
                    </Text>
                    <Text style={[styles.modalHint, { color: colors.textSecondary }]}>
                        Place phone on the structure, then shake the table to simulate an earthquake.
                    </Text>

                    <View style={styles.modalActions}>
                        {!isRunning && peakAmp === 0 && (
                            <TouchableOpacity
                                style={[styles.modalBtnPrimary, { backgroundColor: accentColor }]}
                                onPress={handleStart}
                            >
                                <Ionicons name="play" size={20} color="#FFFFFF" />
                                <Text style={styles.modalBtnPrimaryText}>Start Sensor</Text>
                            </TouchableOpacity>
                        )}
                        {isRunning && (
                            <TouchableOpacity
                                style={[styles.modalBtnPrimary, { backgroundColor: '#EF4444' }]}
                                onPress={handleStop}
                            >
                                <Ionicons name="stop" size={20} color="#FFFFFF" />
                                <Text style={styles.modalBtnPrimaryText}>Stop</Text>
                            </TouchableOpacity>
                        )}
                        {!isRunning && peakAmp > 0 && (
                            <>
                                <TouchableOpacity
                                    style={[styles.modalBtnPrimary, { backgroundColor: accentColor }]}
                                    onPress={handleConfirm}
                                >
                                    <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                                    <Text style={styles.modalBtnPrimaryText}>
                                        Use peak ({peakAmp.toFixed(1)} mm)
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalBtnGhost, { borderColor: colors.border }]}
                                    onPress={() => {
                                        setPeakAmp(0);
                                        setCurrentAmp(0);
                                    }}
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
        gap: Spacing.sm,
        marginTop: Spacing.md,
    },
    field: { flex: 1 },
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
    measureBtn: {
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
    modalAmp: {
        fontSize: 56,
        fontWeight: '700',
        fontVariant: ['tabular-nums'],
        marginTop: Spacing.xl,
    },
    modalPeak: {
        fontSize: Typography.bodyMedium.fontSize,
        marginTop: Spacing.xs,
    },
    modalHint: {
        fontSize: Typography.bodySmall.fontSize,
        textAlign: 'center',
        marginTop: Spacing.sm,
        marginBottom: Spacing.xl,
        paddingHorizontal: Spacing.md,
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
