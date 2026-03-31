/**
 * Tab Navigator Layout
 * Bottom tabs: Home | Leaderboard | Profile
 */

import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';
import { useSettings } from '@/context/SettingsContext';

function TabIcon({ emoji, size }: { emoji: string; size: number }) {
  return <Text style={{ fontSize: size - 4 }}>{emoji}</Text>;
}

export default function TabLayout() {
  const { resolvedTheme } = useSettings();
  const colors = Colors[resolvedTheme];

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          paddingTop: Spacing.xs,
          height: Platform.select({ ios: 88, android: 64 }),
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size }) => <TabIcon emoji="🏠" size={size} />,
          headerTitle: 'STEMM Lab',
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 20,
          },
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Leaderboard',
          tabBarIcon: ({ size }) => <TabIcon emoji="🏆" size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size }) => <TabIcon emoji="👥" size={size} />,
          headerTitle: 'Team Profile',
        }}
      />
    </Tabs>
  );
}
