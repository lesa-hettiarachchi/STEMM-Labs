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
import {
    HAND_FAN_MATERIALS,
    handFanForce,
    type HandFanMaterial,
} from '@/services/calculations';
import { createAccelerometerService } from '@/services/sensors/accelerometer';

const DESIGN_COUNT = 3;
const MATERIAL_OPTIONS: HandFanMaterial[] = ['paper', 'cardstock', 'cardboard'];
const DISTANCE_OPTIONS = ['15', '30', '45'] as const;

interface Props {
    rows: DataTableRow[];
    colors: ThemeColors;
    accentColor: string;
    onChange: (rows: DataTableRow[]) => void;
}

function makeDefaults(): DataTableRow[] {
    return [
        { design: '1 cm folds', material: 'paper', distance: '30', predicted: '', outcome: '', correct: '', notes: '' },
        { design: '', material: 'paper', distance: '30', predicted: '', outcome: '', correct: '', notes: '' },
        { design: '', material: 'paper', distance: '30', predicted: '', outcome: '', correct: '', notes: '' },
    ];
}

function deriveCorrect(predicted: string, actual: string): string {
    const p = parseFloat(predicted);
    const a = parseFloat(actual);
    if (isNaN(p) || isNaN(a)) return '';
    const diff = Math.abs(p - a);
    if (diff < 5) return 'Yes';
    if (diff < 15) return 'Close';
    return 'No';
}

export default function HandFanDataTable({ rows, colors, accentColor, onChange }: Props) {
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

    const handleAngleCaptured = (degrees: number) => {
        if (measureRowIndex === null) return;
        const value = degrees.toFixed(1);
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
                const material = (row.material ?? 'paper') as HandFanMaterial;
                const distance = row.distance ?? '30';
                const angle = parseFloat(row.outcome ?? '');
                const force = !isNaN(angle) && angle > 0
                    ? handFanForce(HAND_FAN_MATERIALS[material].k, angle)
                    : null;
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
                                placeholder={`Describe design ${i + 1}…`}
                                placeholderTextColor={colors.textSecondary}
                            />
                        </View>

                        {/* Material chips */}
                        <Text style={[styles.subLabel, { color: colors.textSecondary }]}>Material</Text>
                        <View style={styles.chipRow}>
                            {MATERIAL_OPTIONS.map((opt) => {
                                const sel = opt === material;
                                return (
                                    <TouchableOpacity
                                        key={opt}
                                        style={[
                                            styles.chip,
                                            {
                                                backgroundColor: sel ? accentColor : colors.backgroundElement,
                                                borderColor: sel ? accentColor : colors.border,
                                            },
                                        ]}
                                        onPress={() => updateCell(i, 'material', opt)}
                                    >
                                        <Text
                                            style={[
                                                styles.chipText,
                                                { color: sel ? '#FFFFFF' : colors.text },
                                            ]}
                                        >
                                            {HAND_FAN_MATERIALS[opt].label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Distance chips */}
                        <Text style={[styles.subLabel, { color: colors.textSecondary }]}>Fan Distance</Text>
                        <View style={styles.chipRow}>
                            {DISTANCE_OPTIONS.map((opt) => {
                                const sel = opt === distance;
                                return (
                                    <TouchableOpacity
                                        key={opt}
                                        style={[
                                            styles.chip,
                                            {
                                                backgroundColor: sel ? accentColor : colors.backgroundElement,
                                                borderColor: sel ? accentColor : colors.border,
                                            },
                                        ]}
                                        onPress={() => updateCell(i, 'distance', opt)}
                                    >
                                        <Text
                                            style={[
                                                styles.chipText,
                                                { color: sel ? '#FFFFFF' : colors.text },
                                            ]}
                                        >
                                            {opt} cm
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Predicted + Actual + Right? */}
                        <View style={styles.fieldsRow}>
                            <View style={styles.field}>
                                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                                    Predicted (°)
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
                                    placeholder="30"
                                    placeholderTextColor={colors.textSecondary}
                                />
                            </View>

                            <View style={styles.field}>
                                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                                    Actual (°)
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
                                        accessibilityLabel={`Measure bend angle for design ${i + 1}`}
                                    >
                                        <Ionicons name="speedometer-outline" size={20} color="#FFFFFF" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        {/* Force + Right? derived row */}
                        <View style={styles.fieldsRow}>
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
                            <View style={styles.field}>
                                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                                    Estimated Force
                                </Text>
                                <View
                                    style={[
                                        styles.derivedBox,
                                        { backgroundColor: colors.backgroundElement },
                                    ]}
                                >
                                    <Text style={[styles.derivedText, { color: accentColor }]}>
                                        {force ? `${force.value} N` : '—'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                );
            })}

            <AngleMeasureModal
                visible={measureRowIndex !== null}
                designLabel={
                    measureRowIndex !== null
                        ? normalised[measureRowIndex].design || `Design ${measureRowIndex + 1}`
                        : ''
                }
                colors={colors}
                accentColor={accentColor}
                onCancel={() => setMeasureRowIndex(null)}
                onCapture={handleAngleCaptured}
            />
        </View>
    );
}

// ─── Live accelerometer angle modal ──────────────────────────────

function AngleMeasureModal({
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
    onCapture: (degrees: number) => void;
}) {
    const accelRef = useRef(createAccelerometerService());
    const [currentAngle, setCurrentAngle] = useState(0);
    const [peakAngle, setPeakAngle] = useState(0);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        if (!visible) return;
        // Open modal → start sensor, reset peak
        setCurrentAngle(0);
        setPeakAngle(0);
        setIsRunning(false);
        accelRef.current.clearReadings();
        return () => {
            // Modal closing → stop sensor cleanly
            accelRef.current.cleanup();
            accelRef.current = createAccelerometerService();
        };
    }, [visible]);

    const handleStart = async () => {
        try {
            await accelRef.current.start(80);
            accelRef.current.setOnReading((reading) => {
                const angle = reading.bendAngleDeg;
                setCurrentAngle(angle);
                setPeakAngle((prev) => (angle > prev ? angle : prev));
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
        onCapture(peakAngle);
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
                        Measuring Bend Angle
                    </Text>
                    <Text style={[styles.modalDesign, { color: colors.text }]} numberOfLines={2}>
                        {designLabel}
                    </Text>

                    <Text style={[styles.modalTime, { color: accentColor }]}>
                        {currentAngle.toFixed(1)}°
                    </Text>
                    <Text style={[styles.modalPeak, { color: colors.textSecondary }]}>
                        Peak observed: {peakAngle.toFixed(1)}°
                    </Text>

                    <View style={styles.modalActions}>
                        {!isRunning && peakAngle === 0 && (
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
                        {!isRunning && peakAngle > 0 && (
                            <>
                                <TouchableOpacity
                                    style={[styles.modalBtnPrimary, { backgroundColor: accentColor }]}
                                    onPress={handleConfirm}
                                >
                                    <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                                    <Text style={styles.modalBtnPrimaryText}>
                                        Use peak ({peakAngle.toFixed(1)}°)
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalBtnGhost, { borderColor: colors.border }]}
                                    onPress={() => {
                                        setPeakAngle(0);
                                        setCurrentAngle(0);
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
    subLabel: {
        fontSize: Typography.labelSmall.fontSize,
        marginBottom: Spacing.xs,
        marginTop: Spacing.sm,
    },
    chipRow: {
        flexDirection: 'row',
        gap: Spacing.xs,
        flexWrap: 'wrap',
    },
    chip: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
    },
    chipText: {
        fontSize: Typography.labelSmall.fontSize,
        fontWeight: '600',
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
    modalTime: {
        fontSize: 56,
        fontWeight: '700',
        fontVariant: ['tabular-nums'],
        marginTop: Spacing.xl,
    },
    modalPeak: {
        fontSize: Typography.bodyMedium.fontSize,
        marginBottom: Spacing.xl,
        marginTop: Spacing.xs,
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
