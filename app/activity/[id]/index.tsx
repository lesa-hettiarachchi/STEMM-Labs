/**
 * Activity Overview Screen (Screen 6)
 * Shows activity details, equipment, curriculum, and start button
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
// import { SafeAreaView } from 'react-native-safe-area-context';

import { getActivityById } from '@/constants/activities';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/theme';
import { useSettings } from '@/context/SettingsContext';
import { useTeam } from '@/context/TeamContext';

export default function ActivityOverviewScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { resolvedTheme } = useSettings();
    const { activityProgress } = useTeam();
    const colors = Colors[resolvedTheme];

    const activity = getActivityById(id);

    if (!activity) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Text style={[styles.errorText, { color: colors.error }]}>
                    Activity not found.
                </Text>
            </View>
        );
    }

    const progress = activityProgress[id];
    const currentIteration = progress?.currentIteration ?? 1;
    const accentColor =
        activity.category === 'engineering' ? colors.engineering : colors.health;

    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: activity.name,
                    headerStyle: { backgroundColor: colors.surface },
                    headerTintColor: colors.text,
                    headerRight: () => (
                        <TouchableOpacity
                            onPress={() => router.push('/help')}
                            accessibilityLabel="Help"
                            style={{ paddingLeft: 1.5, justifyContent: 'center', alignItems: 'center' }}
                        >
                            <Ionicons name="help-circle-outline" size={32} color={colors.text} />
                        </TouchableOpacity>
                    ),
                }}
            />
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Hero Banner */}
                    <View style={[styles.hero, { backgroundColor: accentColor }]}>
                        <Text style={styles.heroIcon}>{activity.icon}</Text>
                        <Text style={styles.heroTitle}>{activity.name}</Text>
                        <View style={styles.heroBadge}>
                            <Text style={styles.heroBadgeText}>
                                {activity.categoryLabel}
                            </Text>
                        </View>
                    </View>

                    {/* Iteration Tracker */}
                    {activity.maxIterations > 1 && (
                        <View
                            style={[
                                styles.iterationCard,
                                { backgroundColor: colors.surface },
                                Shadows.sm,
                            ]}
                        >
                            <Text style={[styles.iterationLabel, { color: colors.textSecondary }]}>
                                Current Progress
                            </Text>
                            <Text style={[styles.iterationText, { color: colors.text }]}>
                                Iteration {currentIteration} of {activity.maxIterations}
                            </Text>
                            {progress?.bestScore !== undefined && (
                                <Text style={[styles.bestScore, { color: colors.primary }]}>
                                    Best: {progress.bestScore} {progress.bestScoreUnit}
                                </Text>
                            )}
                        </View>
                    )}

                    {/* Overview */}
                    <View style={[styles.section, { backgroundColor: colors.surface }, Shadows.sm]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            📖 Overview
                        </Text>
                        <Text style={[styles.bodyText, { color: colors.onSurface }]}>
                            {activity.overview}
                        </Text>
                    </View>

                    {/* Key Measurement */}
                    <View style={[styles.section, { backgroundColor: colors.surface }, Shadows.sm]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            📊 Key Measurement
                        </Text>
                        <View style={[styles.measurementBadge, { backgroundColor: accentColor + '15' }]}>
                            <Text style={[styles.measurementText, { color: accentColor }]}>
                                {activity.sensorLabel} → {activity.keyMeasurement}
                            </Text>
                        </View>
                    </View>

                    {/* Equipment */}
                    <View style={[styles.section, { backgroundColor: colors.surface }, Shadows.sm]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            🧰 Equipment
                        </Text>
                        {activity.equipment.map((item, i) => (
                            <View key={i} style={styles.equipmentRow}>
                                <Text style={[styles.bullet, { color: colors.primary }]}>•</Text>
                                <Text style={[styles.bodyText, { color: colors.onSurface }]}>
                                    {item}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* Curriculum Links */}
                    <View style={[styles.section, { backgroundColor: colors.surface }, Shadows.sm]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            📚 Curriculum Links
                        </Text>
                        {activity.curriculumLinks.map((link, i) => (
                            <View key={i} style={styles.curriculumRow}>
                                <View style={[styles.codeChip, { backgroundColor: accentColor + '15' }]}>
                                    <Text style={[styles.codeText, { color: accentColor }]}>
                                        {link.code}
                                    </Text>
                                </View>
                                <View style={styles.curriculumTextCol}>
                                    <Text style={[styles.curriculumSubject, { color: colors.textSecondary }]}>
                                        {link.subject}
                                    </Text>
                                    <Text style={[styles.curriculumDesc, { color: colors.onSurface }]}>
                                        {link.description}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Spacer for buttons */}
                    <View style={{ height: Spacing.xxxxl }} />
                </ScrollView>

                {/* Bottom Action Buttons */}
                <View style={[styles.bottomBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                    {progress && progress.status !== 'not_started' && (
                        <TouchableOpacity
                            style={[styles.secondaryButton, { borderColor: colors.primary }]}
                            onPress={() => router.push(`/activity/${id}/results`)}
                            accessibilityLabel="View results"
                            accessibilityRole="button"
                        >
                            <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
                                View Results
                            </Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={[
                            styles.primaryButton,
                            { backgroundColor: colors.primary },
                            Shadows.md,
                        ]}
                        onPress={() => router.push(`/activity/${id}/instructions`)}
                        accessibilityLabel="Start activity"
                        accessibilityRole="button"
                    >
                        <Text style={[styles.primaryButtonText, { color: colors.onPrimary }]}>
                            {progress?.status === 'in_progress'
                                ? 'Continue Activity'
                                : 'Start Activity 🚀'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingBottom: 100 },
    errorText: {
        textAlign: 'center',
        marginTop: Spacing.xxxxl,
        fontSize: Typography.bodyLarge.fontSize,
    },
    hero: {
        padding: Spacing.xxl,
        paddingTop: Spacing.xxxl,
        alignItems: 'center',
    },
    heroIcon: { fontSize: 56, marginBottom: Spacing.md },
    heroTitle: {
        fontSize: Typography.headlineLarge.fontSize,
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    heroBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xxs,
        borderRadius: BorderRadius.full,
        marginTop: Spacing.sm,
    },
    heroBadgeText: {
        color: '#FFFFFF',
        fontSize: Typography.labelSmall.fontSize,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    iterationCard: {
        margin: Spacing.lg,
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
    },
    iterationLabel: { fontSize: Typography.bodyMedium.fontSize },
    iterationText: {
        fontSize: Typography.titleMedium.fontSize,
        fontWeight: '600',
        marginTop: Spacing.xxs,
    },
    bestScore: {
        fontSize: Typography.labelLarge.fontSize,
        fontWeight: '600',
        marginTop: Spacing.xs,
    },
    section: {
        marginHorizontal: Spacing.lg,
        marginTop: Spacing.md,
        padding: Spacing.xl,
        borderRadius: BorderRadius.xl,
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
    measurementBadge: {
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
    },
    measurementText: {
        fontSize: Typography.bodyMedium.fontSize,
        fontWeight: '500',
    },
    equipmentRow: {
        flexDirection: 'row',
        marginBottom: Spacing.xs,
    },
    bullet: {
        fontSize: Typography.bodyLarge.fontSize,
        marginRight: Spacing.sm,
        marginTop: 1,
    },
    curriculumRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: Spacing.md,
    },
    codeChip: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xxs,
        borderRadius: BorderRadius.sm,
        marginRight: Spacing.sm,
        marginTop: 2,
    },
    codeText: {
        fontSize: Typography.labelSmall.fontSize,
        fontWeight: '600',
    },
    curriculumTextCol: { flex: 1 },
    curriculumSubject: {
        fontSize: Typography.labelSmall.fontSize,
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
    curriculumDesc: {
        fontSize: Typography.bodyMedium.fontSize,
        marginTop: 1,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        padding: Spacing.lg,
        paddingBottom: Spacing.xxl,
        borderTopWidth: StyleSheet.hairlineWidth,
        gap: Spacing.sm,
    },
    primaryButton: {
        flex: 1,
        height: 52,
        borderRadius: BorderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryButtonText: {
        fontSize: Typography.labelLarge.fontSize,
        fontWeight: '700',
    },
    secondaryButton: {
        height: 52,
        paddingHorizontal: Spacing.xl,
        borderRadius: BorderRadius.lg,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    secondaryButtonText: {
        fontSize: Typography.labelLarge.fontSize,
        fontWeight: '600',
    },
});
