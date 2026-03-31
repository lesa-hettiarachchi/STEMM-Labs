/**
 * Help & Curriculum Screen (Screen 11)
 * Placeholder — full implementation in Sprint 3
 */

import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing, Typography } from '@/constants/theme';
import { useSettings } from '@/context/SettingsContext';

export default function HelpScreen() {
  const { resolvedTheme } = useSettings();
  const colors = Colors[resolvedTheme];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.icon}>❓</Text>
        <Text style={[styles.title, { color: colors.text }]}>
          Help & Curriculum
        </Text>
        <Text style={[styles.body, { color: colors.textSecondary }]}>
          Context-sensitive help will appear here when you access it from an
          activity screen. It includes science explanations, formulas, worked
          examples, and links to ACARA curriculum outcomes.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  icon: { fontSize: 64, marginBottom: Spacing.lg },
  title: {
    fontSize: Typography.headlineMedium.fontSize,
    fontWeight: Typography.headlineMedium.fontWeight,
    marginBottom: Spacing.md,
  },
  body: {
    fontSize: Typography.bodyLarge.fontSize,
    textAlign: 'center',
    lineHeight: 24,
  },
});
