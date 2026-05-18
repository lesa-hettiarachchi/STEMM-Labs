/**
 * Leaderboard Screen
 * Team rankings per activity from Firestore.
 * The tab navigator provides the top header — no custom header here.
 */

import React, { useCallback, useEffect, useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';

import { ACTIVITIES } from '@/constants/activities';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/theme';
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
        } catch {
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

    const selectedDef = ACTIVITIES.find((a) => a.id === selectedActivity)!;
    const accentColor =
        selectedDef.category === 'engineering' ? colors.engineering : colors.health;

    const rankEmoji = (n: number) => (n === 1 ? '🥇' : n === 2 ? '🥈' : n === 3 ? '🥉' : null);

    // ─── Entry card ────────────────────────────────────────────────

    const renderEntry = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
        const rank = index + 1;
        const isMe = team?.id === item.teamId;
        const emoji = rankEmoji(rank);

        return (
            <View
                style={[
                    styles.card,
                    { backgroundColor: isMe ? accentColor + '18' : colors.surface },
                    isMe && { borderColor: accentColor, borderWidth: 1.5 },
                    rank === 1 && styles.cardFirst,
                    Shadows.sm,
                ]}
            >
                {/* Rank badge */}
                <View style={[styles.rankBadge, rank <= 3 && { backgroundColor: accentColor + '20' }]}>
                    {emoji ? (
                        <Text style={styles.rankEmoji}>{emoji}</Text>
                    ) : (
                        <Text style={[styles.rankNumber, { color: colors.textSecondary }]}>
                            {rank}
                        </Text>
                    )}
                </View>

                {/* Team info */}
                <View style={styles.teamInfo}>
                    <View style={styles.nameRow}>
                        <Text style={[styles.teamName, { color: colors.text }]} numberOfLines={1}>
                            {item.teamName}
                            <Text style={[styles.discriminator, { color: colors.textSecondary }]}>
                                {' '}#{item.teamDiscriminator}
                            </Text>
                        </Text>
                        {isMe && (
                            <View style={[styles.youBadge, { backgroundColor: accentColor }]}>
                                <Text style={styles.youText}>You</Text>
                            </View>
                        )}
                    </View>
                    <Text style={[styles.meta, { color: colors.textSecondary }]}>
                        {item.gradeLevel}{item.schoolName ? ` · ${item.schoolName}` : ''}
                    </Text>
                </View>

                {/* Score */}
                <View style={styles.scoreBox}>
                    <Text style={[styles.scoreValue, { color: accentColor }]}>
                        {typeof item.bestScore === 'number' && item.bestScore >= 10
                            ? Math.round(item.bestScore)
                            : item.bestScore}
                    </Text>
                    <Text style={[styles.scoreUnit, { color: colors.textSecondary }]}>
                        {item.bestScoreUnit || 'pts'}
                    </Text>
                </View>
            </View>
        );
    };

    // ─── Render ────────────────────────────────────────────────────

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>

            {/* Activity picker */}
            <View style={[styles.pickerBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.pickerContent}
                >
                    {ACTIVITIES.map((act) => {
                        const sel = act.id === selectedActivity;
                        const chipColor = act.category === 'engineering'
                            ? colors.engineering : colors.health;
                        return (
                            <TouchableOpacity
                                key={act.id}
                                style={[
                                    styles.chip,
                                    { backgroundColor: sel ? chipColor : colors.backgroundElement },
                                    sel && Shadows.sm,
                                ]}
                                onPress={() => setSelectedActivity(act.id)}
                                accessibilityLabel={`Show ${act.name} leaderboard`}
                            >
                                <Text style={styles.chipIcon}>{act.icon}</Text>
                                <Text
                                    style={[styles.chipText, { color: sel ? '#FFFFFF' : colors.text }]}
                                    numberOfLines={1}
                                >
                                    {act.name.split(' ').slice(0, 2).join(' ')}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Selected activity label */}
            <View style={[styles.activityHeader, { backgroundColor: accentColor + '12' }]}>
                <Text style={styles.activityIcon}>{selectedDef.icon}</Text>
                <View>
                    <Text style={[styles.activityName, { color: accentColor }]}>
                        {selectedDef.name}
                    </Text>
                    <Text style={[styles.activityCategory, { color: colors.textSecondary }]}>
                        {selectedDef.categoryLabel}
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.refreshBtn}
                    onPress={onRefresh}
                    accessibilityLabel="Refresh leaderboard"
                >
                    <Ionicons name="refresh" size={20} color={accentColor} />
                </TouchableOpacity>
            </View>

            {/* Content */}
            {loading && !refreshing ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={accentColor} />
                    <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                        Loading rankings…
                    </Text>
                </View>
            ) : entries.length === 0 ? (
                <View style={styles.centered}>
                    <Text style={styles.emptyIcon}>📊</Text>
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>No Rankings Yet</Text>
                    <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                        Complete "{selectedDef.name}" and submit your results to appear here.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={entries}
                    keyExtractor={(item) => item.id}
                    renderItem={renderEntry}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accentColor} />
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },

    // Activity picker bar
    pickerBar: {
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    pickerContent: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        gap: Spacing.sm,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
        gap: Spacing.xs,
    },
    chipIcon: { fontSize: 14 },
    chipText: {
        fontSize: Typography.labelSmall.fontSize,
        fontWeight: '600',
        maxWidth: 100,
    },

    // Activity header strip
    activityHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        gap: Spacing.md,
    },
    activityIcon: { fontSize: 28 },
    activityName: {
        fontSize: Typography.titleMedium.fontSize,
        fontWeight: '700',
    },
    activityCategory: { fontSize: Typography.labelSmall.fontSize, marginTop: 2 },
    refreshBtn: { marginLeft: 'auto' as any },

    // States
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
    loadingText: { fontSize: Typography.bodyMedium.fontSize, marginTop: Spacing.md },
    emptyIcon: { fontSize: 56, marginBottom: Spacing.md },
    emptyTitle: {
        fontSize: Typography.titleLarge.fontSize,
        fontWeight: '600',
        marginBottom: Spacing.sm,
    },
    emptySub: {
        fontSize: Typography.bodyMedium.fontSize,
        textAlign: 'center',
        lineHeight: 22,
        maxWidth: 280,
    },

    // List
    list: { padding: Spacing.md, gap: Spacing.sm, paddingBottom: Spacing.xxxxl },

    // Entry card
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        gap: Spacing.md,
    },
    cardFirst: {
        // Gold shimmer border for #1
        borderColor: '#F59E0B',
        borderWidth: 1.5,
    },
    rankBadge: {
        width: 44,
        height: 44,
        borderRadius: BorderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rankEmoji: { fontSize: 26 },
    rankNumber: {
        fontSize: Typography.titleMedium.fontSize,
        fontWeight: '700',
    },
    teamInfo: { flex: 1 },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
    teamName: {
        fontSize: Typography.bodyLarge.fontSize,
        fontWeight: '600',
        flexShrink: 1,
    },
    discriminator: { fontSize: Typography.bodyMedium.fontSize, fontWeight: '400' },
    youBadge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
        borderRadius: BorderRadius.full,
    },
    youText: {
        color: '#FFFFFF',
        fontSize: Typography.labelSmall.fontSize,
        fontWeight: '700',
    },
    meta: {
        fontSize: Typography.labelSmall.fontSize,
        marginTop: 3,
    },
    scoreBox: { alignItems: 'flex-end', minWidth: 52 },
    scoreValue: {
        fontSize: Typography.titleMedium.fontSize,
        fontWeight: '700',
        fontVariant: ['tabular-nums'],
    },
    scoreUnit: { fontSize: Typography.labelSmall.fontSize, marginTop: 1 },
});
