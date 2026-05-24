import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import EarthquakeDataTable from '@/components/activity/EarthquakeDataTable';
import EditableDataTable from '@/components/activity/EditableDataTable';
import HandFanDataTable from '@/components/activity/HandFanDataTable';
import ParachuteDataTable from '@/components/activity/ParachuteDataTable';
import AccelSensor from '@/components/sensors/AccelSensor';
import ReactionSensor from '@/components/sensors/ReactionSensor';
import SoundSensor from '@/components/sensors/SoundSensor';
import { getActivityById } from '@/constants/activities';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/theme';
import type { DataTableRow } from '@/constants/types';
import { useActivity } from '@/context/ActivityContext';
import { useSettings } from '@/context/SettingsContext';
import { useTeam } from '@/context/TeamContext';

// ─── Activity 5: Guided movements ────────────────────────────────
const GUIDED_MOVEMENTS = [
    {
        icon: 'arrow-up-outline' as const,
        name: 'Movement 1 — Slow Arm Raise',
        desc: 'Hold phone firmly in one hand. Raise your arm slowly overhead, then lower it. Keep movement smooth — no jerking.',
    },
    {
        icon: 'swap-horizontal-outline' as const,
        name: 'Movement 2 — Side Bend',
        desc: 'Hold phone flat against your chest. Slowly bend to the left as far as comfortable, return upright, then bend right.',
    },
    {
        icon: 'arrow-forward-outline' as const,
        name: 'Movement 3 — Forward Reach',
        desc: 'Hold phone in front of you at chest height. Reach forward as far as you can, then slowly return to start position.',
    },
] as const;

export default function DataRecordingScreen() {
    const { id, expiresAt: expiresAtParam } = useLocalSearchParams<{ id: string; expiresAt?: string }>();
    const router = useRouter();
    const { resolvedTheme } = useSettings();
    const { team, activityProgress } = useTeam();
    const {
        session,
        startSession,
        addSensorReading,
        setDataTableRows,
        setRating: setSessionRating,
        setComment: setSessionComment,
        setCalcParam,
        saveSession,
    } = useActivity();
    const colors = Colors[resolvedTheme];

    const activity = getActivityById(id);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Carry over the live countdown from the instructions screen
    const expiresAt = expiresAtParam ? parseInt(expiresAtParam, 10) : 0;
    const [timerSeconds, setTimerSeconds] = useState<number>(() =>
        expiresAt > 0 ? Math.max(0, Math.round((expiresAt - Date.now()) / 1000)) : 0
    );
    useEffect(() => {
        if (!expiresAt || timerSeconds <= 0) return;
        const interval = setInterval(() => {
            const remaining = Math.max(0, Math.round((expiresAt - Date.now()) / 1000));
            setTimerSeconds(remaining);
            if (remaining <= 0) clearInterval(interval);
        }, 1000);
        return () => clearInterval(interval);
    }, [expiresAt]);
    // Parachute-specific setup (applies to all 3 designs in this session)
    const [dropHeight, setDropHeight] = useState('');
    const [toyMass, setToyMass] = useState('');

    const currentIteration = activityProgress[id]?.currentIteration ?? 1;

    // Start session when screen mounts
    useEffect(() => {
        if (activity && !session) {
            startSession(id, currentIteration);
        }
    }, [id, activity]);

    if (!activity) return null;

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec.toString().padStart(2, '0')}`;
    };

    const timerVisible = activity.hasTimer && expiresAt > 0;

    const accentColor =
        activity.category === 'engineering' ? colors.engineering : colors.health;

    // Push parachute setup (drop height + toy mass) to session as it changes.
    // Per-row drop time and contact time live in dataTableRows, not calcParams.
    useEffect(() => {
        if (id === 'parachute-drop') {
            const h = parseFloat(dropHeight);
            const m = parseFloat(toyMass);
            if (!isNaN(h)) setCalcParam('distance', h);
            if (!isNaN(m)) setCalcParam('mass', m);
        }
    }, [dropHeight, toyMass, id]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            setSessionRating(rating);
            setSessionComment(comment);

            const attempt = await saveSession();
            if (attempt) {
                router.push(`/activity/${id}/results`);
            } else {
                Alert.alert('Error', 'Failed to save. Please try again.');
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong while saving.');
        } finally {
            setIsSaving(false);
        }
    };

    // ─── Render sensor based on activity type ─────────────────────
    // Parachute / Hand Fan / Earthquake use inline per-row sensor widgets in
    // their custom data-table components, so they don't need a standalone
    // sensor block.  Only the activities below render here.
    const renderSensor = () => {
        switch (activity.sensorType) {
            case 'microphone':
                return (
                    <SoundSensor
                        colors={colors}
                        accentColor={accentColor}
                        onReadingUpdate={() => {}}
                        onSaveReading={(saved) => {
                            // Each "Save Zone" tap stores the dB snapshot plus
                            // its GPS coordinates and zone label so the results
                            // screen can compute averages and the zone map can
                            // render colour-coded markers.
                            addSensorReading({
                                id: Date.now().toString(36),
                                sensorType: 'microphone',
                                value: saved.db,
                                unit: 'dB',
                                timestamp: Date.now(),
                                latitude: saved.latitude,
                                longitude: saved.longitude,
                                label: saved.label,
                            });
                        }}
                    />
                );

            case 'accelerometer': {
                // Hand fan and earthquake use inline per-row sensor modals
                if (id === 'hand-fan' || id === 'earthquake-structure') return null;

                // Pick the right mode based on activity ID (IDs use hyphens)
                let mode: 'angle' | 'vibration' | 'smoothness' | 'breathing';
                if (id === 'human-performance') mode = 'smoothness';
                else mode = 'breathing'; // breathing-pace

                return (
                    <AccelSensor
                        mode={mode}
                        colors={colors}
                        accentColor={accentColor}
                        onReadingUpdate={() => {}}
                    />
                );
            }

            case 'touchscreen':
                return (
                    <ReactionSensor
                        colors={colors}
                        accentColor={accentColor}
                        members={team?.members ?? []}
                        onComplete={(results) => {
                            if (results.length > 0) {
                                const avg = Math.round(
                                    results.reduce((s, r) => s + r.reactionTimeMs, 0) /
                                        results.length
                                );
                                const best = Math.min(
                                    ...results.map((r) => r.reactionTimeMs)
                                );
                                setCalcParam('avgReaction', avg);
                                setCalcParam('bestReaction', best);
                            }
                        }}
                    />
                );

            default:
                return (
                    <View style={[styles.sensorPlaceholder, { backgroundColor: colors.backgroundElement }]}>
                        <Text style={styles.placeholderIcon}>📡</Text>
                        <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
                            {activity.sensorLabel}
                        </Text>
                    </View>
                );
        }
    };

    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: 'Record Data',
                    headerStyle: { backgroundColor: colors.surface },
                    headerTintColor: colors.text,
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => {
                                if (router.canGoBack()) router.back();
                                else router.replace(`/activity/${id}`);
                            }}
                            accessibilityLabel="Go back"
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
                {/* Sticky countdown — visible on record screen when parachute timer is running */}
                {timerVisible && (
                    <View style={[
                        styles.stickyTimer,
                        { backgroundColor: timerSeconds <= 60 ? '#EF4444' : accentColor },
                    ]}>
                        <Ionicons
                            name={timerSeconds <= 60 ? 'alarm-outline' : 'time-outline'}
                            size={16}
                            color="#FFFFFF"
                        />
                        <Text style={styles.stickyTimerText}>
                            {formatTime(timerSeconds)} remaining
                        </Text>
                    </View>
                )}
                <KeyboardAvoidingView
                    style={styles.kavWrap}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    // On Android, native windowSoftInputMode + extra scroll padding does the work;
                    // on iOS we need explicit padding behaviour to lift fields above the keyboard.
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
                >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Activity 5 — Movement Guide (shown above the sensor) */}
                    {id === 'human-performance' && (
                        <View style={[styles.movementGuideCard, { backgroundColor: colors.surface }, Shadows.sm]}>
                            <View style={styles.sectionTitleRow}>
                                <Ionicons name="walk-outline" size={18} color={colors.text} />
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                    Movement Guide
                                </Text>
                            </View>
                            <Text style={[styles.movementIntro, { color: colors.textSecondary }]}>
                                Perform each movement slowly while holding the phone. The sensor measures speed and smoothness.
                            </Text>
                            {GUIDED_MOVEMENTS.map((m, i) => (
                                <View key={i} style={[styles.movementRow, { borderTopColor: colors.border }]}>
                                    <View style={[styles.movementIconWrap, { backgroundColor: accentColor + '15' }]}>
                                        <Ionicons name={m.icon} size={20} color={accentColor} />
                                    </View>
                                    <View style={styles.movementText}>
                                        <Text style={[styles.movementName, { color: colors.text }]}>{m.name}</Text>
                                        <Text style={[styles.movementDesc, { color: colors.textSecondary }]}>{m.desc}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Sensor Display Area — hidden for activities that use inline per-row sensors */}
                    {id !== 'parachute-drop' && id !== 'hand-fan' && id !== 'earthquake-structure' && (
                        <View
                            style={[
                                styles.sensorArea,
                                { backgroundColor: colors.surface },
                                Shadows.md,
                            ]}
                        >
                            <Text style={[styles.sensorTitle, { color: colors.text }]}>
                                {activity.sensorLabel}
                            </Text>
                            {renderSensor()}
                        </View>
                    )}

                    {/* Parachute — Setup card (drop height + toy mass apply to all 3 designs) */}
                    {id === 'parachute-drop' && (
                        <View
                            style={[
                                styles.measureCard,
                                { backgroundColor: colors.surface },
                                Shadows.sm,
                            ]}
                        >
                            <View style={styles.sectionTitleRow}>
                                <Ionicons name="settings-outline" size={18} color={colors.text} />
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                    Setup (applies to all designs)
                                </Text>
                            </View>
                            <View style={styles.inputRow}>
                                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                                    Drop Height (m)
                                </Text>
                                <TextInput
                                    style={[styles.measureInput, { backgroundColor: colors.backgroundElement, color: colors.text, borderColor: colors.border }]}
                                    keyboardType="decimal-pad"
                                    placeholder="e.g. 1.0"
                                    placeholderTextColor={colors.textSecondary}
                                    value={dropHeight}
                                    onChangeText={setDropHeight}
                                    accessibilityLabel="Drop height in metres"
                                />
                            </View>
                            <View style={styles.inputRow}>
                                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                                    Toy Mass (kg)
                                </Text>
                                <TextInput
                                    style={[styles.measureInput, { backgroundColor: colors.backgroundElement, color: colors.text, borderColor: colors.border }]}
                                    keyboardType="decimal-pad"
                                    placeholder="e.g. 0.20"
                                    placeholderTextColor={colors.textSecondary}
                                    value={toyMass}
                                    onChangeText={setToyMass}
                                    accessibilityLabel="Toy mass in kilograms"
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.inlineCameraBtn, { borderColor: accentColor }]}
                                onPress={() => router.push(`/activity/${id}/camera`)}
                                accessibilityLabel="Open camera to record slow-motion drop video"
                                accessibilityRole="button"
                            >
                                <Ionicons name="videocam-outline" size={18} color={accentColor} />
                                <Text style={[styles.inlineCameraBtnText, { color: accentColor }]}>
                                    Record Slow-Motion Drop Video
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Data Table — Parachute and Hand Fan use custom 3-design tables with inline sensors */}
                    <View
                        style={[
                            styles.tableCard,
                            { backgroundColor: colors.surface },
                            Shadows.sm,
                        ]}
                    >
                        <View style={styles.sectionTitleRow}>
                            <Ionicons
                                name={
                                    id === 'parachute-drop' || id === 'hand-fan' || id === 'earthquake-structure'
                                        ? 'layers-outline'
                                        : 'list-outline'
                                }
                                size={18}
                                color={colors.text}
                            />
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                {id === 'parachute-drop'
                                    ? 'Parachute Designs (up to 3)'
                                    : id === 'hand-fan'
                                        ? 'Fan Designs (up to 3)'
                                        : id === 'earthquake-structure'
                                            ? 'Structure Designs (up to 3)'
                                            : 'Data Table'}
                            </Text>
                        </View>
                        {id === 'parachute-drop' ? (
                            <ParachuteDataTable
                                rows={session?.dataTableRows ?? []}
                                colors={colors}
                                accentColor={accentColor}
                                onChange={(rows) => setDataTableRows(rows)}
                            />
                        ) : id === 'hand-fan' ? (
                            <HandFanDataTable
                                rows={session?.dataTableRows ?? []}
                                colors={colors}
                                accentColor={accentColor}
                                onChange={(rows) => setDataTableRows(rows)}
                            />
                        ) : id === 'earthquake-structure' ? (
                            <EarthquakeDataTable
                                rows={session?.dataTableRows ?? []}
                                colors={colors}
                                accentColor={accentColor}
                                onChange={(rows) => setDataTableRows(rows)}
                            />
                        ) : (
                            <EditableDataTable
                                columns={activity.dataTable.columns}
                                initialRows={activity.dataTable.exampleRows}
                                colors={colors}
                                accentColor={accentColor}
                                onDataChange={(rows: DataTableRow[]) => {
                                    setDataTableRows(rows);
                                }}
                            />
                        )}
                    </View>

                    {/* Star Rating */}
                    <View
                        style={[
                            styles.ratingCard,
                            { backgroundColor: colors.surface },
                            Shadows.sm,
                        ]}
                    >
                        <View style={styles.sectionTitleRow}>
                            <Ionicons name="star-outline" size={18} color={colors.text} />
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                Rate This Activity
                            </Text>
                        </View>
                        <View style={styles.starsRow}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity
                                    key={star}
                                    onPress={() => setRating(star)}
                                    accessibilityLabel={`Rate ${star} star${star > 1 ? 's' : ''}`}
                                >
                                    <Ionicons
                                        name={star <= rating ? 'star' : 'star-outline'}
                                        size={32}
                                        color={star <= rating ? '#F59E0B' : colors.textSecondary}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Comments */}
                        <Text style={[styles.commentLabel, { color: colors.textSecondary }]}>
                            Reflection / Comments
                        </Text>
                        <TextInput
                            style={[
                                styles.commentInput,
                                {
                                    backgroundColor: colors.backgroundElement,
                                    color: colors.text,
                                    borderColor: colors.border,
                                },
                            ]}
                            placeholder="What did you observe? Any surprises?"
                            placeholderTextColor={colors.textSecondary}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            value={comment}
                            onChangeText={setComment}
                            accessibilityLabel="Activity reflection comment"
                        />
                    </View>
                </ScrollView>
                </KeyboardAvoidingView>

                {/* Bottom Actions */}
                <View style={[styles.bottomBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                    <TouchableOpacity
                        style={[
                            styles.saveButton,
                            { backgroundColor: colors.primary, opacity: isSaving ? 0.6 : 1 },
                            Shadows.md,
                        ]}
                        onPress={handleSave}
                        disabled={isSaving}
                        accessibilityLabel="Save and continue to results"
                        accessibilityRole="button"
                    >
                        <Text style={styles.saveButtonText}>
                            {isSaving ? 'Saving...' : 'Save & Continue →'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    stickyTimer: {
        flexDirection: 'row',
        gap: Spacing.xs,
        paddingVertical: Spacing.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stickyTimerText: {
        color: '#FFFFFF',
        fontSize: Typography.labelLarge.fontSize,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    kavWrap: { flex: 1 },
    scrollContent: {
        padding: Spacing.lg,
        // Generous bottom padding so the keyboard doesn't cover the last input
        // (rating + comment) — KeyboardAvoidingView lifts the keyboard but the
        // scroll content still needs room to scroll past the bottom action bar.
        paddingBottom: 220,
    },
    sensorArea: {
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
        marginBottom: Spacing.lg,
    },
    sensorTitle: {
        fontSize: Typography.titleMedium.fontSize,
        fontWeight: '600',
        marginBottom: Spacing.lg,
        textAlign: 'center',
    },
    sensorPlaceholder: {
        padding: Spacing.xxl,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
    },
    placeholderIcon: { fontSize: 48, marginBottom: Spacing.md },
    placeholderText: { fontSize: Typography.bodyMedium.fontSize, fontStyle: 'italic' },
    measureCard: {
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
    },
    inputRow: {
        marginBottom: Spacing.md,
    },
    inputLabel: {
        fontSize: Typography.labelLarge.fontSize,
        fontWeight: '500',
        marginBottom: Spacing.xs,
    },
    measureInput: {
        height: 44,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        paddingHorizontal: Spacing.md,
        fontSize: Typography.bodyLarge.fontSize,
    },
    tableCard: {
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
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
    ratingCard: {
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
        marginBottom: Spacing.lg,
    },
    starsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: Spacing.md,
        marginBottom: Spacing.xl,
    },
    commentLabel: {
        fontSize: Typography.labelLarge.fontSize,
        fontWeight: '500',
        marginBottom: Spacing.sm,
    },
    commentInput: {
        height: 100,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        padding: Spacing.md,
        fontSize: Typography.bodyLarge.fontSize,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: Spacing.lg,
        paddingBottom: Spacing.xxl,
        borderTopWidth: StyleSheet.hairlineWidth,
    },
    saveButton: {
        height: 52,
        borderRadius: BorderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: Typography.labelLarge.fontSize,
        fontWeight: '700',
    },
    // ── Activity 5: Movement guide ──────────────────────────────
    movementGuideCard: {
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
    },
    movementIntro: {
        fontSize: Typography.bodyMedium.fontSize,
        lineHeight: 20,
        marginBottom: Spacing.md,
    },
    movementRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingTop: Spacing.md,
        marginTop: Spacing.sm,
        borderTopWidth: StyleSheet.hairlineWidth,
        gap: Spacing.md,
    },
    movementIconWrap: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 2,
    },
    movementText: { flex: 1 },
    movementName: {
        fontSize: Typography.labelLarge.fontSize,
        fontWeight: '600',
        marginBottom: Spacing.xxs,
    },
    movementDesc: {
        fontSize: Typography.bodyMedium.fontSize,
        lineHeight: 20,
    },
    // ── Parachute: inline camera shortcut ───────────────────────
    inlineCameraBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: Spacing.lg,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        borderRadius: BorderRadius.lg,
        borderWidth: 1.5,
        gap: Spacing.sm,
    },
    inlineCameraBtnText: {
        fontSize: Typography.labelLarge.fontSize,
        fontWeight: '600',
    },
});
