import { ThemedText as Text } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { batteryColor, batteryIconName, useBattery } from '@/hooks/useBattery';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { ACTIVITIES } from '@/constants/activities';
import { BorderRadius, Colors, Shadows, Spacing, ThemeColors, Typography } from '@/constants/theme';
import { useSettings } from '@/context/SettingsContext';
import { useTeam } from '@/context/TeamContext';
import { updateTeam as updateTeamCloud } from '@/services/firestore';

export default function ProfileScreen() {
    const { team, activityProgress, updateTeam } = useTeam();
    const { resolvedTheme } = useSettings();
    const colors = Colors[resolvedTheme];
    const battery = useBattery();
    const [isEditing, setIsEditing] = useState(false);
    const [editSchool, setEditSchool] = useState(team?.schoolName ?? '');
    const [editMembers, setEditMembers] = useState<string[]>(
        team?.members.map((m) => m.firstName) ?? []
    );

    if (!team) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    No team profile found.
                </Text>
            </View>
        );
    }

    // Stats
    const completedCount = Object.values(activityProgress).filter(
        (p) => p.status === 'completed'
    ).length;
    const inProgressCount = Object.values(activityProgress).filter(
        (p) => p.status === 'in_progress'
    ).length;

    const handleSaveEdit = async () => {
        const updatedMembers = editMembers
            .filter((m) => m.trim())
            .map((firstName, i) => ({
                id: team.members[i]?.id ?? Date.now().toString(36) + i,
                firstName: firstName.trim(),
            }));

        if (updatedMembers.length === 0) {
            Alert.alert('Error', 'At least one team member is required.');
            return;
        }

        const updates = {
            schoolName: editSchool.trim() || undefined,
            members: updatedMembers,
        };

        await updateTeam(updates);
        updateTeamCloud(team.id, updates).catch(console.warn);
        setIsEditing(false);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Team Header Card */}
                <View style={[styles.headerCard, { backgroundColor: colors.primary }]}>
                    <Image source={require('@/assets/icons/teamIcon.png')} style={{ width: 128, height: 128 }} />
                    <Text style={styles.teamName}>{team.name}</Text>
                    <View style={styles.discriminatorBadge}>
                        <Text style={styles.discriminatorText}>#{team.discriminator}</Text>
                    </View>
                    <Text style={styles.gradeBadge}>{team.gradeLevel}</Text>
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <StatCard
                        label="Completed"
                        value={completedCount.toString()}
                        iconName="checkmark-circle-outline"
                        colors={colors}
                    />
                    <StatCard
                        label="In Progress"
                        value={inProgressCount.toString()}
                        iconName="sync-circle-outline"
                        colors={colors}
                    />
                    <StatCard
                        label="Total"
                        value={ACTIVITIES.length.toString()}
                        iconName="clipboard-outline"
                        colors={colors}
                    />
                </View>

                {/* Battery Card */}
                {battery.isLoaded && (
                    <View style={[styles.batteryCard, { backgroundColor: colors.surface }, Shadows.sm]}>
                        <Ionicons
                            name={batteryIconName(battery.level, battery.isCharging)}
                            size={26}
                            color={batteryColor(battery.level)}
                        />
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.batteryLabel, { color: colors.textSecondary }]}>
                                Device Battery
                            </Text>
                            <View style={styles.batteryBarTrack}>
                                <View
                                    style={[
                                        styles.batteryBarFill,
                                        {
                                            width: `${Math.round((battery.level ?? 0) * 100)}%` as any,
                                            backgroundColor: batteryColor(battery.level),
                                        },
                                    ]}
                                />
                            </View>
                        </View>
                        <Text style={[
                            styles.batteryPct,
                            { color: batteryColor(battery.level) },
                        ]}>
                            {battery.level !== null
                                ? `${Math.round(battery.level * 100)}%`
                                : '—'}
                        </Text>
                        {battery.isCharging && (
                            <Text style={[styles.chargingBadge, { color: colors.statusCompleted }]}>
                                Charging
                            </Text>
                        )}
                    </View>
                )}

                {/* Info Card */}
                <View style={[styles.infoCard, { backgroundColor: colors.surface }, Shadows.sm]}>
                    <View style={styles.infoHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="information-circle-outline" size={24} color={colors.primary} style={{ marginRight: Spacing.sm }} />
                            <Text style={[styles.infoTitle, { color: colors.text }]}>
                                Team Details
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => {
                                if (isEditing) {
                                    handleSaveEdit();
                                } else {
                                    setEditSchool(team.schoolName ?? '');
                                    setEditMembers(team.members.map((m) => m.firstName));
                                    setIsEditing(true);
                                }
                            }}
                            accessibilityLabel={isEditing ? 'Save changes' : 'Edit profile'}
                            accessibilityRole="button"
                        >
                            <Text style={[styles.editButton, { color: colors.primary }]}>
                                {isEditing ? 'Save' : 'Edit'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* School */}
                    <View style={styles.infoRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xs }}>
                            <Ionicons name="business-outline" size={18} color={colors.textSecondary} style={{ marginRight: Spacing.xs }} />
                            <Text style={[styles.infoLabel, { color: colors.textSecondary, marginBottom: 0 }]}>
                                School
                            </Text>
                        </View>
                        {isEditing ? (
                            <TextInput
                                style={[
                                    styles.editInput,
                                    {
                                        backgroundColor: colors.backgroundElement,
                                        color: colors.text,
                                        borderColor: colors.border,
                                    },
                                ]}
                                value={editSchool}
                                onChangeText={setEditSchool}
                                placeholder="School name"
                                placeholderTextColor={colors.textSecondary}
                            />
                        ) : (
                            <Text style={[styles.infoValue, { color: colors.text }]}>
                                {team.schoolName || 'Not specified'}
                            </Text>
                        )}
                    </View>

                    {/* Members */}
                    <View style={styles.infoRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xs }}>
                            <Ionicons name="person-outline" size={18} color={colors.textSecondary} style={{ marginRight: Spacing.xs }} />
                            <Text style={[styles.infoLabel, { color: colors.textSecondary, marginBottom: 0 }]}>
                                Members
                            </Text>
                        </View>
                    </View>
                    {isEditing
                        ? editMembers.map((name, i) => (
                            <View key={i} style={styles.memberEditRow}>
                                <TextInput
                                    style={[
                                        styles.editInput,
                                        styles.memberEditInput,
                                        {
                                            backgroundColor: colors.backgroundElement,
                                            color: colors.text,
                                            borderColor: colors.border,
                                        },
                                    ]}
                                    value={name}
                                    onChangeText={(text) => {
                                        const updated = [...editMembers];
                                        updated[i] = text;
                                        setEditMembers(updated);
                                    }}
                                    placeholder={`Member ${i + 1}`}
                                    placeholderTextColor={colors.textSecondary}
                                />
                            </View>
                        ))
                        : team.members.map((member, i) => (
                            <View
                                key={member.id}
                                style={[
                                    styles.memberChip,
                                    { backgroundColor: colors.backgroundElement },
                                ]}
                            >
                                <Text style={[styles.memberName, { color: colors.text }]}>
                                    {member.firstName}
                                </Text>
                            </View>
                        ))}

                    {isEditing && editMembers.length < 6 && (
                        <TouchableOpacity
                            onPress={() => setEditMembers([...editMembers, ''])}
                            style={[styles.addMemberBtn, { borderColor: colors.primary }]}
                        >
                            <Text style={{ color: colors.primary, fontWeight: '500' }}>
                                + Add Member
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

function StatCard({
    label,
    value,
    iconName,
    colors,
}: {
    label: string;
    value: string;
    iconName: any;
    colors: ThemeColors;
}) {
    return (
        <View style={[styles.statCard, { backgroundColor: colors.surface }, Shadows.sm]}>
            <Ionicons name={iconName} size={28} color={colors.primary} style={{ marginBottom: Spacing.xs }} />
            <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                {label}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: Spacing.lg, paddingBottom: Spacing.xxxxl },
    emptyText: {
        textAlign: 'center',
        marginTop: Spacing.xxxxl,
        fontSize: Typography.bodyLarge.fontSize,
    },
    headerCard: {
        borderRadius: BorderRadius.xl,
        padding: Spacing.xxl,
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    teamEmoji: { fontSize: 48, marginBottom: Spacing.sm },
    teamName: {
        fontSize: Typography.headlineLarge.fontSize,
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    discriminatorBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xxs,
        borderRadius: BorderRadius.full,
        marginTop: Spacing.sm,
    },
    discriminatorText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: Typography.labelLarge.fontSize,
        letterSpacing: 1,
    },
    gradeBadge: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: Typography.bodyMedium.fontSize,
        marginTop: Spacing.xs,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: Spacing.sm,
        marginBottom: Spacing.lg,
    },
    statCard: {
        flex: 1,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        alignItems: 'center',
    },
    statIcon: { fontSize: 24, marginBottom: Spacing.xs },
    statValue: {
        fontSize: Typography.titleLarge.fontSize,
        fontWeight: '700',
    },
    statLabel: {
        fontSize: Typography.labelSmall.fontSize,
        marginTop: Spacing.xxs,
    },
    batteryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
        gap: Spacing.md,
    },
    batteryLabel: {
        fontSize: Typography.labelSmall.fontSize,
        marginBottom: Spacing.xs,
    },
    batteryBarTrack: {
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: BorderRadius.full,
        overflow: 'hidden',
    },
    batteryBarFill: {
        height: 8,
        borderRadius: BorderRadius.full,
    },
    batteryPct: {
        fontSize: Typography.titleMedium.fontSize,
        fontWeight: '700',
        minWidth: 48,
        textAlign: 'right',
    },
    chargingBadge: {
        fontSize: Typography.labelSmall.fontSize,
        fontWeight: '600',
    },
    infoCard: {
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
    },
    infoHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    infoTitle: {
        fontSize: Typography.titleMedium.fontSize,
        fontWeight: '600',
    },
    editButton: {
        fontSize: Typography.labelLarge.fontSize,
        fontWeight: '600',
    },
    infoRow: {
        marginBottom: Spacing.md,
    },
    infoLabel: {
        fontSize: Typography.bodyMedium.fontSize,
        marginBottom: Spacing.xs,
    },
    infoValue: {
        fontSize: Typography.bodyLarge.fontSize,
    },
    memberChip: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.xs,
    },
    memberName: {
        fontSize: Typography.bodyLarge.fontSize,
    },
    editInput: {
        height: 44,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        paddingHorizontal: Spacing.md,
        fontSize: Typography.bodyLarge.fontSize,
    },
    memberEditRow: { marginBottom: Spacing.sm },
    memberEditInput: {},
    addMemberBtn: {
        height: 40,
        borderRadius: BorderRadius.md,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Spacing.xs,
    },
});
