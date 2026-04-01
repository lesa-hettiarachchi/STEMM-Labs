/**
 * Home Screen (Screen 4)
 * Card-based layout showing all 7 activities grouped by category
 */

import { useRouter } from 'expo-router';
import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { ThemedText as Text } from '@/components/ThemedText';

import {
  ENGINEERING_ACTIVITIES,
  HEALTH_ACTIVITIES,
} from '@/constants/activities';
import { BorderRadius, Colors, Shadows, Spacing, ThemeColors, Typography } from '@/constants/theme';
import type { ActivityDefinition, ActivityStatus } from '@/constants/types';
import { useSettings } from '@/context/SettingsContext';
import { useTeam } from '@/context/TeamContext';

export default function HomeScreen() {
  const router = useRouter();
  const { resolvedTheme } = useSettings();
  const { activityProgress } = useTeam();
  const colors = Colors[resolvedTheme];

  const getStatus = (id: string): ActivityStatus =>
    activityProgress[id]?.status ?? 'not_started';

  const getBestScore = (id: string) => activityProgress[id]?.bestScore;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Engineering Challenges */}
        <CategorySection
          title="Engineering Challenges"
          accentColor={colors.engineering}
          activities={ENGINEERING_ACTIVITIES}
          colors={colors}
          getStatus={getStatus}
          getBestScore={getBestScore}
          onPress={(id) => router.push(`/activity/${id}`)}
        />

        {/* Health & Medical Sciences */}
        <CategorySection
          title="Health & Medical Sciences"
          accentColor={colors.health}
          activities={HEALTH_ACTIVITIES}
          colors={colors}
          getStatus={getStatus}
          getBestScore={getBestScore}
          onPress={(id) => router.push(`/activity/${id}`)}
        />
      </ScrollView>
    </View>
  );
}

// ─── Category Section ────────────────────────────────────────────

function CategorySection({
  title,
  accentColor,
  activities,
  colors,
  getStatus,
  getBestScore,
  onPress,
}: {
  title: string;
  accentColor: string;
  activities: ActivityDefinition[];
  colors: ThemeColors;
  getStatus: (id: string) => ActivityStatus;
  getBestScore: (id: string) => number | undefined;
  onPress: (id: string) => void;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View
          style={[styles.sectionAccent, { backgroundColor: accentColor }]}
        />
        <Text
          style={[
            styles.sectionTitle,
            { color: colors.text },
          ]}
        >
          {title}
        </Text>
      </View>
      {activities.map((activity) => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          status={getStatus(activity.id)}
          bestScore={getBestScore(activity.id)}
          colors={colors}
          accentColor={accentColor}
          onPress={() => onPress(activity.id)}
        />
      ))}
    </View>
  );
}

// ─── Activity Card ───────────────────────────────────────────────

function ActivityCard({
  activity,
  status,
  bestScore,
  colors,
  accentColor,
  onPress,
}: {
  activity: ActivityDefinition;
  status: ActivityStatus;
  bestScore?: number;
  colors: ThemeColors;
  accentColor: string;
  onPress: () => void;
}) {
  const statusConfig = {
    not_started: { label: 'Not Started', color: colors.statusNotStarted },
    in_progress: { label: 'In Progress', color: colors.statusInProgress },
    completed: { label: 'Completed', color: colors.statusCompleted },
  };

  const { label: statusLabel, color: statusColor } = statusConfig[status];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderLeftColor: accentColor,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
        Shadows.md,
      ]}
      onPress={onPress}
      accessibilityLabel={`${activity.name}. ${statusLabel}. ${activity.shortDescription}`}
      accessibilityRole="button"
    >
      {/* Icon + Content */}
      <View style={styles.cardContent}>
        <Text style={styles.cardIcon}>{activity.icon}</Text>
        <View style={styles.cardTextContainer}>
          <Text
            style={[styles.cardTitle, { color: colors.text }]}
            numberOfLines={1}
          >
            {activity.name}
          </Text>
          <Text
            style={[styles.cardDescription, { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            {activity.shortDescription}
          </Text>
          <View style={styles.cardMeta}>
            <Text
              style={[styles.categoryLabel, { color: accentColor }]}
            >
              {activity.categoryLabel}
            </Text>
          </View>
        </View>
      </View>

      {/* Footer: Status + Score */}
      <View style={styles.cardFooter}>
        <View style={styles.statusBadge}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: statusColor },
            ]}
          />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {statusLabel}
          </Text>
        </View>
        {bestScore !== undefined && (
          <View
            style={[
              styles.scoreBadge,
              { backgroundColor: colors.backgroundSelected },
            ]}
          >
            <Text style={[styles.scoreText, { color: colors.primary }]}>
              Best: {bestScore}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

// ─── Styles ──────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxxl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionAccent: {
    width: 4,
    height: 24,
    borderRadius: 2,
    marginRight: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.headlineMedium.fontSize,
    fontWeight: Typography.headlineMedium.fontWeight,
  },
  card: {
    borderRadius: BorderRadius.lg,
    borderLeftWidth: 4,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardIcon: {
    fontSize: 36,
    marginRight: Spacing.md,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: Typography.titleMedium.fontSize,
    fontWeight: Typography.titleMedium.fontWeight,
    marginBottom: Spacing.xxs,
  },
  cardDescription: {
    fontSize: Typography.bodyMedium.fontSize,
    lineHeight: Typography.bodyMedium.lineHeight,
    marginBottom: Spacing.sm,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryLabel: {
    fontSize: Typography.labelSmall.fontSize,
    fontWeight: Typography.labelSmall.fontWeight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.xs,
  },
  statusText: {
    fontSize: Typography.labelSmall.fontSize,
    fontWeight: Typography.labelSmall.fontWeight,
  },
  scoreBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: BorderRadius.full,
  },
  scoreText: {
    fontSize: Typography.labelSmall.fontSize,
    fontWeight: '600',
  },
});
