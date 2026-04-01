/**
 * Data Recording Screen (Screen 8)
 * Sensor data capture placeholder — full sensor integration in Sprint 2
 */

import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { getActivityById } from '@/constants/activities';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/theme';
import { useSettings } from '@/context/SettingsContext';

export default function DataRecordingScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { resolvedTheme } = useSettings();
    const colors = Colors[resolvedTheme];

    const activity = getActivityById(id);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    if (!activity) return null;

    const accentColor =
        activity.category === 'engineering' ? colors.engineering : colors.health;

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
                        <Text style={styles.sensorIcon}>📡</Text>
                        <Text style={[styles.sensorTitle, { color: colors.text }]}>
                            {activity.sensorLabel}
                        </Text>
                        <Text style={[styles.sensorHint, { color: colors.textSecondary }]}>
                            Sensor integration coming in Sprint 2
                        </Text>
                        <View
                            style={[
                                styles.measurementDisplay,
                                { backgroundColor: colors.backgroundElement },
                            ]}
                        >
                            <Text style={[styles.measurementLabel, { color: colors.textSecondary }]}>
                                {activity.keyMeasurement}
                            </Text>
                            <Text style={[styles.measurementValue, { color: accentColor }]}>
                                — —
                            </Text>
                        </View>
                    </View>

                    {/* Data Table */}
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
                        {/* Table Header */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View>
                                <View style={[styles.tableRow, { backgroundColor: accentColor + '15' }]}>
                                    {activity.dataTable.columns.map((col) => (
                                        <Text
                                            key={col.key}
                                            style={[styles.tableHeaderCell, { color: accentColor }]}
                                        >
                                            {col.label}
                                        </Text>
                                    ))}
                                </View>
                                {/* Table Rows */}
                                {activity.dataTable.exampleRows.map((row, ri) => (
                                    <View
                                        key={ri}
                                        style={[
                                            styles.tableRow,
                                            { borderBottomColor: colors.border },
                                        ]}
                                    >
                                        {row.map((cell, ci) => (
                                            <Text
                                                key={ci}
                                                style={[styles.tableCell, { color: colors.text }]}
                                            >
                                                {cell || '—'}
                                            </Text>
                                        ))}
                                    </View>
                                ))}
                            </View>
                        </ScrollView>
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
                            { backgroundColor: colors.primary },
                            Shadows.md,
                        ]}
                        onPress={() => router.push(`/activity/${id}/results`)}
                        accessibilityLabel="Save and continue to results"
                        accessibilityRole="button"
                    >
                        <Text style={styles.saveButtonText}>Save & Continue →</Text>
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
        padding: Spacing.xxl,
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    sensorIcon: { fontSize: 48, marginBottom: Spacing.md },
    sensorTitle: {
        fontSize: Typography.titleMedium.fontSize,
        fontWeight: '600',
    },
    sensorHint: {
        fontSize: Typography.bodyMedium.fontSize,
        marginTop: Spacing.xs,
        fontStyle: 'italic',
    },
    measurementDisplay: {
        width: '100%',
        padding: Spacing.xl,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        marginTop: Spacing.xl,
    },
    measurementLabel: {
        fontSize: Typography.bodyMedium.fontSize,
        marginBottom: Spacing.xs,
    },
    measurementValue: {
        fontSize: Typography.displayLarge.fontSize,
        fontWeight: '700',
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
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    tableHeaderCell: {
        width: 140,
        padding: Spacing.sm,
        fontSize: Typography.labelSmall.fontSize,
        fontWeight: '600',
    },
    tableCell: {
        width: 140,
        padding: Spacing.sm,
        fontSize: Typography.bodyMedium.fontSize,
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
