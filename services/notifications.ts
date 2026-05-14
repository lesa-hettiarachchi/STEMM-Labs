/**
 * Local Push Notifications
 * Sends alerts when activities are completed and for reminders.
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export async function registerForNotifications(): Promise<void> {
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
