/**
 * Root Layout — App Entry Point
 * Stack navigator with conditional routing (splash → register or tabs)
 */

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';

import { SettingsProvider, useSettings } from '@/context/SettingsContext';
import { TeamProvider } from '@/context/TeamContext';
import { ActivityProvider } from '@/context/ActivityContext';
import { Colors } from '@/constants/theme';
import { registerForNotifications } from '@/services/notifications';
import { registerBackgroundSync } from '@/services/backgroundTask';

function RootStack() {
  const { resolvedTheme } = useSettings();
  const colors = Colors[resolvedTheme];

  useEffect(() => {
    registerForNotifications().catch(console.warn);
    registerBackgroundSync().catch(console.warn);
  }, []);

  return (
    <>
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          headerBackTitle: 'Back',
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen
          name="register"
          options={{
            gestureEnabled: false, // Can't go back from registration
          }}
        />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="settings"
          options={{
            headerShown: true,
            title: 'Settings',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="help"
          options={{
            headerShown: true,
            title: 'Help & Curriculum',
            presentation: 'modal',
          }}
        />
        <Stack.Screen name="activity/[id]/index" />
        <Stack.Screen name="activity/[id]/instructions" />
        <Stack.Screen name="activity/[id]/record" />
        <Stack.Screen name="activity/[id]/results" />
        <Stack.Screen
          name="activity/[id]/camera"
          options={{
            presentation: 'fullScreenModal',
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SettingsProvider>
      <TeamProvider>
        <ActivityProvider>
          <RootStack />
        </ActivityProvider>
      </TeamProvider>
    </SettingsProvider>
  );
}
