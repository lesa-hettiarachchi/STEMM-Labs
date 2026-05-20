import * as BackgroundFetch from 'expo-background-fetch';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as TaskManager from 'expo-task-manager';
import { getUnsyncedAttempts, markAttemptSynced } from './database';
import { saveAttempt } from './firestore';
import { notifyActivityReminder } from './notifications';
import { getActivityProgress, getTeamProfile } from './storage';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export const BACKGROUND_SYNC_TASK = 'STEMM_BACKGROUND_SYNC';

export async function syncPendingAttempts(): Promise<{
    pushed: number;
    failed: number;
}> {
    let pushed = 0;
    let failed = 0;

    try {
        const team = await getTeamProfile();
        if (!team) return { pushed, failed };

        const pending = await getUnsyncedAttempts(team.id);
        if (pending.length === 0) return { pushed, failed };

        // Push in parallel (Firestore batches under the hood)
        await Promise.all(
            pending.map(async (attempt) => {
                try {
                    await saveAttempt(attempt);
                    await markAttemptSynced(attempt.id);
                    pushed++;
                } catch {
                    failed++;
                }
            })
        );
    } catch (err) {
        console.warn('[backgroundTask] syncPendingAttempts failed:', err);
    }

    if (pushed > 0) {
        console.log(`[backgroundTask] Synced ${pushed} pending attempts to Firestore`);
    }
    return { pushed, failed };
}

// ─── Task Definition ─────────────────────────────────────────────

TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
    try {
        // Push any offline-saved attempts now that we may be online
        const result = await syncPendingAttempts();

        // Also remind students about in-progress activities they haven't finished
        const progress = await getActivityProgress();
        const inProgressActivities = Object.entries(progress)
            .filter(([, p]) => p.status === 'in_progress')
            .map(([id]) => id);

        if (inProgressActivities.length > 0) {
            const activityId = inProgressActivities[0];
            const label = activityId
                .split('-')
                .map((w) => w[0].toUpperCase() + w.slice(1))
                .join(' ');
            await notifyActivityReminder(label);
        }

        return result.pushed > 0
            ? BackgroundFetch.BackgroundFetchResult.NewData
            : BackgroundFetch.BackgroundFetchResult.NoData;
    } catch {
        return BackgroundFetch.BackgroundFetchResult.Failed;
    }
});

// ─── Registration ─────────────────────────────────────────────────

export async function registerBackgroundSync(): Promise<void> {
    if (isExpoGo) {
        console.log('[backgroundTask] Skipping background sync registration in Expo Go.');
        return;
    }

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
            minimumInterval: 15 * 60,
            stopOnTerminate: false,
            startOnBoot: true,
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
