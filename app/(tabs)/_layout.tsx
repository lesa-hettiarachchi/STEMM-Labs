/**
 * Tab Navigator Layout
 * Bottom tabs: Home | Leaderboard | Profile
 */

import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';
import { useSettings } from '@/context/SettingsContext';

export default function TabLayout() {
  const { resolvedTheme } = useSettings();
  const colors = Colors[resolvedTheme];
  const router = useRouter();

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
          tabBarIcon: ({ size, color }) => <Ionicons name="home" size={size} color={color} />,
          headerTitle: 'STEMM Labs',
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 20,
          },
          headerRight: () => (
            <TouchableOpacity
              style={{ marginRight: Spacing.lg, padding: Spacing.xs }}
              onPress={() => router.push('/settings')}
              accessibilityLabel="Open settings"
              accessibilityRole="button"
            >
              <Ionicons name="settings" size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Leaderboard',
          tabBarIcon: ({ size, color }) => <Ionicons name="trophy" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ size, color }) => <Ionicons name="map" size={size} color={color} />,
          headerTitle: 'Activity Map',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color }) => <Ionicons name="people" size={size} color={color} />,
          headerTitle: 'Team Profile',
        }}
      />
    </Tabs>
  );
}
