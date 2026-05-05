/**
 * Help & Curriculum Screen (Screen 11)
 * Context-sensitive: shows discussion, formulas, curriculum links for an activity
 * Can also be opened generically to browse all activities
 */

import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { ACTIVITIES } from '@/constants/activities';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { useSettings } from '@/context/SettingsContext';

export default function HelpScreen() {
    const { resolvedTheme } = useSettings();
    const colors = Colors[resolvedTheme];
    const params = useLocalSearchParams<{ activityId?: string }>();

    // If an activityId is provided, show that activity directly
    const initialIndex = params.activityId
        ? ACTIVITIES.findIndex(a => a.id === params.activityId)
        : -1;

    const [expandedId, setExpandedId] = useState<string | null>(
        initialIndex >= 0 ? ACTIVITIES[initialIndex].id : null
    );

    const toggleExpand = (id: string) => {
        setExpandedId(prev => (prev === id ? null : id));
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Intro */}
                <View style={[styles.introCard, { backgroundColor: colors.surface }, Shadows.sm]}>
                    <Text style={[styles.introTitle, { color: colors.text }]}>
                        📚 Help & Curriculum Guide
                    </Text>
                    <Text style={[styles.introBody, { color: colors.textSecondary }]}>
                        Tap an activity below to view the science discussion, formulas,
                        worked examples, and ACARA curriculum links.
                    </Text>
                </View>

                {/* Activity List */}
                {ACTIVITIES.map((activity) => {
                    const isExpanded = expandedId === activity.id;
                    const accentColor =
                        activity.category === 'engineering'
                            ? colors.engineering
                            : colors.health;

                    return (
                        <View
                            key={activity.id}
                            style={[
                                styles.activityCard,
                                { backgroundColor: colors.surface },
                                Shadows.sm,
                            ]}
                        >
                            {/* Header (tappable) */}
                            <TouchableOpacity
                                style={styles.activityHeader}
                                onPress={() => toggleExpand(activity.id)}
                                accessibilityLabel={`${isExpanded ? 'Collapse' : 'Expand'} ${activity.name}`}
                            >
                                <Text style={styles.activityIcon}>{activity.icon}</Text>
                                <View style={styles.activityHeaderText}>
                                    <Text style={[styles.activityName, { color: colors.text }]}>
                                        {activity.name}
                                    </Text>
                                    <Text style={[styles.activityCategory, { color: accentColor }]}>
                                        {activity.categoryLabel}
                                    </Text>
                                </View>
                                <Text style={[styles.chevron, { color: colors.textSecondary }]}>
                                    {isExpanded ? '▲' : '▼'}
                                </Text>
                            </TouchableOpacity>

                            {/* Expanded Content */}
                            {isExpanded && (
                                <View style={styles.expandedContent}>
                                    {/* Discussion */}
                                    {activity.discussion && (
                                        <View style={styles.section}>
                                            <Text style={[styles.sectionTitle, { color: accentColor }]}>
                                                💡 Science Discussion
                                            </Text>
                                            <Text style={[styles.sectionBody, { color: colors.text }]}>
                                                {activity.discussion}
                                            </Text>
                                        </View>
                                    )}

                                    {/* Formulas */}
                                    {activity.formulas && activity.formulas.length > 0 && (
                                        <View style={styles.section}>
                                            <Text style={[styles.sectionTitle, { color: accentColor }]}>
                                                📐 Formulas
                                            </Text>
                                            {activity.formulas.map((f, i) => (
                                                <View
                                                    key={i}
                                                    style={[
                                                        styles.formulaCard,
                                                        { backgroundColor: colors.backgroundElement },
                                                    ]}
                                                >
                                                    <View style={styles.formulaHeader}>
                                                        <Text style={[styles.formulaName, { color: colors.text }]}>
                                                            {f.name}
                                                        </Text>
                                                        <Text
                                                            style={[
                                                                styles.levelBadge,
                                                                {
                                                                    backgroundColor:
                                                                        f.level === 'primary'
                                                                            ? '#10B981'
                                                                            : '#6366F1',
                                                                },
                                                            ]}
                                                        >
                                                            {f.level === 'primary' ? 'Primary' : 'Secondary'}
                                                        </Text>
                                                    </View>
                                                    <Text style={[styles.formulaText, { color: accentColor }]}>
                                                        {f.formula}
                                                    </Text>
                                                    {f.example && (
                                                        <Text style={[styles.exampleText, { color: colors.textSecondary }]}>
                                                            Example: {f.example}
                                                        </Text>
                                                    )}
                                                </View>
                                            ))}
                                        </View>
                                    )}

                                    {/* Curriculum Links */}
                                    {activity.curriculumLinks && activity.curriculumLinks.length > 0 && (
                                        <View style={styles.section}>
                                            <Text style={[styles.sectionTitle, { color: accentColor }]}>
                                                🎓 ACARA Curriculum Links
                                            </Text>
                                            {activity.curriculumLinks.map((link, i) => (
                                                <View
                                                    key={i}
                                                    style={[
                                                        styles.curriculumRow,
                                                        { borderBottomColor: colors.border },
                                                    ]}
                                                >
                                                    <Text style={[styles.currSubject, { color: colors.text }]}>
                                                        {link.subject}
                                                    </Text>
                                                    <Text style={[styles.currCode, { color: accentColor }]}>
                                                        {link.code}
                                                    </Text>
                                                    <Text style={[styles.currDesc, { color: colors.textSecondary }]}>
                                                        {link.description}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>
                                    )}

                                    {/* Equipment */}
                                    {activity.equipment && activity.equipment.length > 0 && (
                                        <View style={styles.section}>
                                            <Text style={[styles.sectionTitle, { color: accentColor }]}>
                                                🧰 Equipment Needed
                                            </Text>
                                            {activity.equipment.map((item, i) => (
                                                <Text
                                                    key={i}
                                                    style={[styles.equipmentItem, { color: colors.text }]}
                                                >
                                                    • {item}
                                                </Text>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            )}
                        </View>
                    );
                })}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: {
        padding: Spacing.md,
    },
    introCard: {
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
        marginBottom: Spacing.lg,
    },
    introTitle: {
        fontSize: Typography.titleLarge.fontSize,
        fontWeight: '700',
        marginBottom: Spacing.sm,
    },
    introBody: {
        fontSize: Typography.bodyMedium.fontSize,
        lineHeight: 22,
    },
    activityCard: {
        borderRadius: BorderRadius.xl,
        marginBottom: Spacing.md,
        overflow: 'hidden',
    },
    activityHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
    },
    activityIcon: { fontSize: 32, marginRight: Spacing.md },
    activityHeaderText: { flex: 1 },
    activityName: {
        fontSize: Typography.bodyLarge.fontSize,
        fontWeight: '600',
    },
    activityCategory: {
        fontSize: Typography.labelSmall.fontSize,
        fontWeight: '500',
        marginTop: 2,
    },
    chevron: { fontSize: 14 },
    expandedContent: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.lg,
    },
    section: {
        marginBottom: Spacing.lg,
    },
    sectionTitle: {
        fontSize: Typography.labelLarge.fontSize,
        fontWeight: '700',
        marginBottom: Spacing.sm,
    },
    sectionBody: {
        fontSize: Typography.bodyMedium.fontSize,
        lineHeight: 22,
    },
    formulaCard: {
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
    },
    formulaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    formulaName: {
        fontSize: Typography.bodyMedium.fontSize,
        fontWeight: '600',
    },
    levelBadge: {
        fontSize: 10,
        color: '#FFFFFF',
        fontWeight: '700',
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
        borderRadius: BorderRadius.full,
        overflow: 'hidden',
    },
    formulaText: {
        fontSize: Typography.bodyMedium.fontSize,
        fontWeight: '500',
        fontFamily: 'monospace',
        marginBottom: Spacing.xxs,
    },
    exampleText: {
        fontSize: Typography.bodySmall.fontSize,
        fontStyle: 'italic',
    },
    curriculumRow: {
        paddingVertical: Spacing.sm,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    currSubject: {
        fontSize: Typography.bodyMedium.fontSize,
        fontWeight: '600',
    },
    currCode: {
        fontSize: Typography.bodySmall.fontSize,
        fontWeight: '500',
        fontFamily: 'monospace',
        marginVertical: 2,
    },
    currDesc: {
        fontSize: Typography.bodySmall.fontSize,
    },
    equipmentItem: {
        fontSize: Typography.bodyMedium.fontSize,
        lineHeight: 24,
    },
});
