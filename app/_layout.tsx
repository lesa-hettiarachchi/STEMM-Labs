import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';

import { SettingsProvider, useSettings } from '@/context/SettingsContext';
import { TeamProvider } from '@/context/TeamContext';
import { ActivityProvider } from '@/context/ActivityContext';
import { AuthProvider } from '@/context/AuthContext';
import { Colors } from '@/constants/theme';
import { registerForNotifications } from '@/services/notifications';
import { registerBackgroundSync, syncPendingAttempts } from '@/services/backgroundTask';

function RootStack() {
  const { resolvedTheme } = useSettings();
  const colors = Colors[resolvedTheme];

  useEffect(() => {
    registerForNotifications().catch(console.warn);
    registerBackgroundSync().catch(console.warn);
    // On launch, push any SQLite attempts that were saved while offline.
    // Safe to call always — does nothing if nothing pending or no network.
    syncPendingAttempts().catch(console.warn);
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
          name="login"
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="signup"
          options={{
            gestureEnabled: false,
          }}
        />
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
      <AuthProvider>
        <TeamProvider>
          <ActivityProvider>
            <RootStack />
          </ActivityProvider>
        </TeamProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}
