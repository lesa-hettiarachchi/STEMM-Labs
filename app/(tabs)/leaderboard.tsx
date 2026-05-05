/**
 * Leaderboard Screen (Screen 5)
 * Shows team rankings per activity from Firestore
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { ACTIVITIES } from '@/constants/activities';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import type { LeaderboardEntry } from '@/constants/types';
import { useSettings } from '@/context/SettingsContext';
import { useTeam } from '@/context/TeamContext';
import { getLeaderboard } from '@/services/firestore';

export default function LeaderboardScreen() {
    const { resolvedTheme } = useSettings();
    const { team } = useTeam();
    const colors = Colors[resolvedTheme];

    const [selectedActivity, setSelectedActivity] = useState(ACTIVITIES[0].id);
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const fetchLeaderboard = useCallback(async (activityId: string) => {
        setLoading(true);
        try {
            const data = await getLeaderboard(activityId);
            setEntries(data);
        } catch (error) {
            console.warn('Failed to fetch leaderboard:', error);
            setEntries([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLeaderboard(selectedActivity);
    }, [selectedActivity]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchLeaderboard(selectedActivity);
        setRefreshing(false);
    }, [selectedActivity]);

    const selectedActivityDef = ACTIVITIES.find(a => a.id === selectedActivity);
    const accentColor =
        selectedActivityDef?.category === 'engineering'
            ? colors.engineering
            : colors.health;

    const getRankEmoji = (rank: number) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `#${rank}`;
    };

    const renderEntry = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
        const rank = index + 1;
        const isMyTeam = team?.id === item.teamId;

        return (
            <View
                style={[
                    styles.entryCard,
                    { backgroundColor: isMyTeam ? accentColor + '15' : colors.surface },
                    isMyTeam && { borderColor: accentColor, borderWidth: 1.5 },
                    Shadows.sm,
                ]}
            >
                <Text style={[styles.rank, rank <= 3 && styles.rankTop]}>
                    {getRankEmoji(rank)}
                </Text>
                <View style={styles.entryInfo}>
                    <Text style={[styles.teamName, { color: colors.text }]}>
                        {item.teamName}
                        {isMyTeam ? ' (You)' : ''}
                    </Text>
                    <Text style={[styles.gradeText, { color: colors.textSecondary }]}>
                        {item.gradeLevel}
                    </Text>
                </View>
                <View style={styles.scoreBox}>
                    <Text style={[styles.scoreValue, { color: accentColor }]}>
                        {typeof item.bestScore === 'number'
                            ? item.bestScore.toFixed(1)
                            : item.bestScore}
                    </Text>
                    <Text style={[styles.scoreUnit, { color: colors.textSecondary }]}>
                        pts
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.surface }, Shadows.sm]}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>🏆 Leaderboard</Text>
            </View>

            {/* Activity Filter */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
            >
                {ACTIVITIES.map((act) => {
                    const isSelected = act.id === selectedActivity;
                    const actColor =
                        act.category === 'engineering'
                            ? colors.engineering
                            : colors.health;
                    return (
                        <TouchableOpacity
                            key={act.id}
                            style={[
                                styles.filterChip,
                                {
                                    backgroundColor: isSelected
                                        ? actColor
                                        : colors.backgroundElement,
                                },
                            ]}
                            onPress={() => setSelectedActivity(act.id)}
                            accessibilityLabel={`Show ${act.name} leaderboard`}
                        >
                            <Text style={styles.filterIcon}>{act.icon}</Text>
                            <Text
                                style={[
                                    styles.filterText,
                                    { color: isSelected ? '#FFFFFF' : colors.text },
                                ]}
                                numberOfLines={1}
                            >
                                {act.name.split(' ')[0]}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* Content */}
            {loading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={accentColor} />
                    <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                        Loading rankings...
                    </Text>
                </View>
            ) : entries.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>📊</Text>
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>
                        No Rankings Yet
                    </Text>
                    <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                        Complete "{selectedActivityDef?.name}" and submit your results
                        to appear on the leaderboard!
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={entries}
                    keyExtractor={(item) => item.id}
                    renderItem={renderEntry}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={accentColor}
                        />
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingTop: 60,
        paddingBottom: Spacing.lg,
        paddingHorizontal: Spacing.lg,
    },
    headerTitle: {
        fontSize: Typography.headlineMedium.fontSize,
        fontWeight: Typography.headlineMedium.fontWeight,
    },
    filterRow: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        gap: Spacing.sm,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
        gap: Spacing.xxs,
    },
    filterIcon: { fontSize: 16 },
    filterText: {
        fontSize: Typography.labelSmall.fontSize,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: Typography.bodyMedium.fontSize,
        marginTop: Spacing.md,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    emptyIcon: { fontSize: 64, marginBottom: Spacing.lg },
    emptyTitle: {
        fontSize: Typography.titleLarge.fontSize,
        fontWeight: '600',
        marginBottom: Spacing.sm,
    },
    emptySubtitle: {
        fontSize: Typography.bodyMedium.fontSize,
        textAlign: 'center',
        lineHeight: 22,
    },
    listContent: {
        padding: Spacing.md,
        gap: Spacing.sm,
    },
    entryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
    },
    rank: {
        fontSize: 20,
        width: 40,
        textAlign: 'center',
    },
    rankTop: { fontSize: 28 },
    entryInfo: {
        flex: 1,
        marginLeft: Spacing.sm,
    },
    teamName: {
        fontSize: Typography.bodyLarge.fontSize,
        fontWeight: '600',
    },
    gradeText: {
        fontSize: Typography.labelSmall.fontSize,
        marginTop: 2,
    },
    scoreBox: {
        alignItems: 'flex-end',
    },
    scoreValue: {
        fontSize: Typography.titleMedium.fontSize,
        fontWeight: '700',
        fontVariant: ['tabular-nums'],
    },
    scoreUnit: {
        fontSize: Typography.labelSmall.fontSize,
    },
});
