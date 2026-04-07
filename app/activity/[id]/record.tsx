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

export default function DataRecordingScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { resolvedTheme } = useSettings();
    const { team, activityProgress } = useTeam();
    const {
        session,
        startSession,
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
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
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
});
