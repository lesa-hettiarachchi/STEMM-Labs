/**
 * Background Task / Work Manager
 * Uses expo-task-manager + expo-background-fetch to run periodic tasks
 * when the app is in the background — equivalent to Android WorkManager.
 *
 * Registered task: check for unsynced activity attempts and fire a
 * reminder notification if any in-progress activities are found.
 */

import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { getActivityProgress } from './storage';
import { notifyActivityReminder } from './notifications';

export const BACKGROUND_SYNC_TASK = 'STEMM_BACKGROUND_SYNC';

// ─── Task Definition ─────────────────────────────────────────────

TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
    try {
        const progress = await getActivityProgress();

        const inProgressActivities = Object.entries(progress)
            .filter(([, p]) => p.status === 'in_progress')
            .map(([id]) => id);

        if (inProgressActivities.length > 0) {
            // Use the first in-progress activity for the reminder label
            const activityId = inProgressActivities[0];
            const label = activityId
                .split('-')
                .map((w) => w[0].toUpperCase() + w.slice(1))
                .join(' ');

            await notifyActivityReminder(label);
        }

        return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch {
        return BackgroundFetch.BackgroundFetchResult.Failed;
    }
});

// ─── Registration ─────────────────────────────────────────────────

export async function registerBackgroundSync(): Promise<void> {
    const status = await BackgroundFetch.getStatusAsync();
    if (
        status === BackgroundFetch.BackgroundFetchStatus.Restricted ||
        status === BackgroundFetch.BackgroundFetchStatus.Denied
    ) {
        console.warn('Background fetch is not available on this device.');
        return;
    }

    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);
    if (!isRegistered) {
        await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
            minimumInterval: 15 * 60, // 15 minutes
            stopOnTerminate: false,   // Android: keep running when app is terminated
            startOnBoot: true,        // Android: restart on device reboot
        });
    }
}

export async function unregisterBackgroundSync(): Promise<void> {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);
    if (isRegistered) {
        await BackgroundFetch.unregisterTaskAsync(BACKGROUND_SYNC_TASK);
    }
}

export async function getBackgroundSyncStatus(): Promise<{
    isRegistered: boolean;
    status: BackgroundFetch.BackgroundFetchStatus | null;
}> {
    const [isRegistered, status] = await Promise.all([
        TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK),
        BackgroundFetch.getStatusAsync(),
    ]);
    return { isRegistered, status };
}
