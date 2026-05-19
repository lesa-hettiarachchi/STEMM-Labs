/**
 * Local Push Notifications
 * Sends alerts when activities are completed and for reminders.
 *
 * NOTE: expo-notifications remote push is unavailable in Expo Go (SDK 53+).
 * All calls are guarded so the app still runs in Expo Go without crashing.
 */

import * as Notifications from 'expo-notifications';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

/** True when running inside Expo Go (not a custom dev build or production). */
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// Only configure the notification handler in real builds.
// In Expo Go on Android SDK 53+, this import-time call causes a hard crash.
if (!isExpoGo) {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowBanner: true,
            shouldShowList: true,
        }),
    });
}

export async function registerForNotifications(): Promise<void> {
    // Local (scheduled) notifications still work in Expo Go; remote push does not.
    // Skip channel registration gracefully if the module is unavailable.
    if (isExpoGo && Platform.OS === 'android') {
        console.log('[notifications] Skipping notification setup in Expo Go on Android.');
        return;
    }

    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') return;
    }

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('stemm-alerts', {
            name: 'STEMM Labs Alerts',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#1A9B7B',
            sound: 'default',
        });
    }
}

export async function notifyActivityComplete(activityName: string): Promise<void> {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: 'Activity Complete!',
            body: `Great work! You finished "${activityName}". Check your results.`,
            sound: true,
            data: { type: 'activity_complete', activityName },
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 2 },
    });
}

export async function notifyActivityReminder(activityName: string): Promise<void> {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: 'Activity In Progress',
            body: `Don't forget to finish "${activityName}" and submit your results!`,
            sound: true,
            data: { type: 'activity_reminder', activityName },
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 60 },
    });
}

export async function cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
}
