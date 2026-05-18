/**
 * Data Recording Screen (Screen 8)
 * Live sensor data + editable data table + save to Firestore
 */

import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import EditableDataTable from '@/components/activity/EditableDataTable';
import AccelSensor from '@/components/sensors/AccelSensor';
import ParachuteSensor from '@/components/sensors/ParachuteSensor';
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
        icon: '🦾',
        name: 'Movement 1 — Slow Arm Raise',
        desc: 'Hold phone firmly in one hand. Raise your arm slowly overhead, then lower it. Keep movement smooth — no jerking.',
    },
    {
        icon: '🤸',
        name: 'Movement 2 — Side Bend',
        desc: 'Hold phone flat against your chest. Slowly bend to the left as far as comfortable, return upright, then bend right.',
    },
    {
        icon: '🫲',
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
    // Parachute-specific measurement inputs
    const [dropHeight, setDropHeight] = useState('');
    const [toyMass, setToyMass] = useState('');
    const [contactTime, setContactTime] = useState('');

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

    // Push parachute measurement params to session whenever they change
    useEffect(() => {
        if (id === 'parachute-drop') {
            const h = parseFloat(dropHeight);
            const m = parseFloat(toyMass);
            const ct = parseFloat(contactTime);
            if (!isNaN(h)) setCalcParam('distance', h);
            if (!isNaN(m)) setCalcParam('mass', m);
            if (!isNaN(ct)) setCalcParam('contactTime', ct);
        }
    }, [dropHeight, toyMass, contactTime, id]);

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
    const renderSensor = () => {
        switch (activity.sensorType) {
            case 'camera':
                // Parachute uses camera for slow-motion video, but also needs a timer
                // for measuring drop time. Show the timer here; camera is separate screen.
                return (
                    <ParachuteSensor
                        colors={colors}
                        accentColor={accentColor}
                        onTimerResult={(seconds) => {
                            setCalcParam('time', seconds);
                        }}
                    />
                );

            case 'timer':
                return (
                    <ParachuteSensor
                        colors={colors}
                        accentColor={accentColor}
                        onTimerResult={(seconds) => {
                            setCalcParam('time', seconds);
                        }}
                    />
                );

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
                // Pick the right mode based on activity ID (IDs use hyphens)
                let mode: 'angle' | 'vibration' | 'smoothness' | 'breathing';
                if (id === 'hand-fan') mode = 'angle';
                else if (id === 'earthquake-structure') mode = 'vibration';
                else if (id === 'human-performance') mode = 'smoothness';
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
                        <Text style={styles.stickyTimerText}>
                            {timerSeconds <= 60 ? '⚠️ ' : '⏱️ '}
                            {formatTime(timerSeconds)} remaining
                        </Text>
                    </View>
                )}
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Activity 5 — Movement Guide (shown above the sensor) */}
                    {id === 'human-performance' && (
                        <View style={[styles.movementGuideCard, { backgroundColor: colors.surface }, Shadows.sm]}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                🏃 Movement Guide
                            </Text>
                            <Text style={[styles.movementIntro, { color: colors.textSecondary }]}>
                                Perform each movement slowly while holding the phone. The sensor measures speed and smoothness.
                            </Text>
                            {GUIDED_MOVEMENTS.map((m, i) => (
                                <View key={i} style={[styles.movementRow, { borderTopColor: colors.border }]}>
                                    <Text style={styles.movementIcon}>{m.icon}</Text>
                                    <View style={styles.movementText}>
                                        <Text style={[styles.movementName, { color: colors.text }]}>{m.name}</Text>
                                        <Text style={[styles.movementDesc, { color: colors.textSecondary }]}>{m.desc}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Sensor Display Area */}
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

                        {/* Parachute — inline camera shortcut so students can record the fall
                            right at the moment the instruction says to, not just from results */}
                        {id === 'parachute-drop' && (
                            <TouchableOpacity
                                style={[styles.inlineCameraBtn, { borderColor: accentColor }]}
                                onPress={() => router.push(`/activity/${id}/camera`)}
                                accessibilityLabel="Open camera to record slow-motion drop video"
                                accessibilityRole="button"
                            >
                                <Ionicons name="videocam-outline" size={18} color={accentColor} />
                                <Text style={[styles.inlineCameraBtnText, { color: accentColor }]}>
                                    📹 Record Slow-Motion Drop Video
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Parachute Measurement Inputs */}
                    {id === 'parachute-drop' && (
                        <View
                            style={[
                                styles.measureCard,
                                { backgroundColor: colors.surface },
                                Shadows.sm,
                            ]}
                        >
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                📏 Measurements
                            </Text>
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
                            <View style={styles.inputRow}>
                                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                                    Contact Time (s) — from slow-motion
                                </Text>
                                <TextInput
                                    style={[styles.measureInput, { backgroundColor: colors.backgroundElement, color: colors.text, borderColor: colors.border }]}
                                    keyboardType="decimal-pad"
                                    placeholder="e.g. 0.05"
                                    placeholderTextColor={colors.textSecondary}
                                    value={contactTime}
                                    onChangeText={setContactTime}
                                    accessibilityLabel="Contact time in seconds from slow-motion video"
                                />
                            </View>
                        </View>
                    )}

                    {/* Editable Data Table */}
                    <View
                        style={[
                            styles.tableCard,
                            { backgroundColor: colors.surface },
                            Shadows.sm,
                        ]}
                    >
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            📋 Data Table
                        </Text>
                        <EditableDataTable
                            columns={activity.dataTable.columns}
                            initialRows={activity.dataTable.exampleRows}
                            colors={colors}
                            accentColor={accentColor}
                            onDataChange={(rows: DataTableRow[]) => {
                                setDataTableRows(rows);
                            }}
                        />
                    </View>

                    {/* Star Rating */}
                    <View
                        style={[
                            styles.ratingCard,
                            { backgroundColor: colors.surface },
                            Shadows.sm,
                        ]}
                    >
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            ⭐ Rate This Activity
                        </Text>
                        <View style={styles.starsRow}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity
                                    key={star}
                                    onPress={() => setRating(star)}
                                    accessibilityLabel={`Rate ${star} star${star > 1 ? 's' : ''}`}
                                >
                                    <Text
                                        style={[
                                            styles.star,
                                            { opacity: star <= rating ? 1 : 0.3 },
                                        ]}
                                    >
                                        ⭐
                                    </Text>
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
        paddingVertical: Spacing.sm,
        alignItems: 'center',
    },
    stickyTimerText: {
        color: '#FFFFFF',
        fontSize: Typography.labelLarge.fontSize,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    scrollContent: {
        padding: Spacing.lg,
        paddingBottom: 100,
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
    sectionTitle: {
        fontSize: Typography.titleMedium.fontSize,
        fontWeight: '600',
        marginBottom: Spacing.md,
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
    star: { fontSize: 32 },
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
    movementIcon: { fontSize: 28, marginTop: 2 },
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
