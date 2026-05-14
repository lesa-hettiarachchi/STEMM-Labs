/**
 * INTEGRATION TESTS — notifications service
 * Person 2
 *
 * Tests the notification service with a mocked expo-notifications module.
 * Verifies that the service correctly calls the underlying Expo API
 * with the right parameters.
 */

// jest.mock calls are hoisted before imports, so the factory must not
// reference variables declared in the test file (they aren't initialised yet).
// We use jest.fn() inline and access mocks via the module reference.
jest.mock('expo-notifications', () => ({
    setNotificationHandler: jest.fn(),
    getPermissionsAsync: jest.fn(),
    requestPermissionsAsync: jest.fn(),
    setNotificationChannelAsync: jest.fn(),
    scheduleNotificationAsync: jest.fn(),
    cancelAllScheduledNotificationsAsync: jest.fn(),
    AndroidImportance: { HIGH: 4 },
    SchedulableTriggerInputTypes: { TIME_INTERVAL: 'timeInterval' },
}));

jest.mock('react-native', () => ({
    Platform: { OS: 'ios' },
}));

import * as Notifications from 'expo-notifications';
import {
    cancelAllNotifications,
    notifyActivityComplete,
    notifyActivityReminder,
    registerForNotifications,
} from '../services/notifications';

// Typed handles to the mocked functions
const mockGetPermissions = Notifications.getPermissionsAsync as jest.Mock;
const mockRequestPermissions = Notifications.requestPermissionsAsync as jest.Mock;
const mockSetChannel = Notifications.setNotificationChannelAsync as jest.Mock;
const mockSchedule = Notifications.scheduleNotificationAsync as jest.Mock;
const mockCancelAll = Notifications.cancelAllScheduledNotificationsAsync as jest.Mock;

beforeEach(() => {
    jest.clearAllMocks();
});

// ─── registerForNotifications ─────────────────────────────────────

describe('registerForNotifications', () => {
    it('does not request permissions if already granted', async () => {
        mockGetPermissions.mockResolvedValue({ status: 'granted' });
        await registerForNotifications();
        expect(mockRequestPermissions).not.toHaveBeenCalled();
    });

    it('requests permissions when not yet granted', async () => {
        mockGetPermissions.mockResolvedValue({ status: 'undetermined' });
        mockRequestPermissions.mockResolvedValue({ status: 'granted' });
        await registerForNotifications();
        expect(mockRequestPermissions).toHaveBeenCalledTimes(1);
    });

    it('returns early without registering a channel if permission denied', async () => {
        mockGetPermissions.mockResolvedValue({ status: 'undetermined' });
        mockRequestPermissions.mockResolvedValue({ status: 'denied' });
        await registerForNotifications();
        expect(mockSetChannel).not.toHaveBeenCalled();
    });
});

// ─── notifyActivityComplete ───────────────────────────────────────

describe('notifyActivityComplete', () => {
    it('schedules a notification with the activity name in the body', async () => {
        await notifyActivityComplete('Parachute Drop Challenge');

        expect(mockSchedule).toHaveBeenCalledTimes(1);
        const call = mockSchedule.mock.calls[0][0];
        expect(call.content.title).toBe('Activity Complete!');
        expect(call.content.body).toContain('Parachute Drop Challenge');
    });

    it('fires after a 2-second delay', async () => {
        await notifyActivityComplete('Sound Pollution Hunter');
        const call = mockSchedule.mock.calls[0][0];
        expect(call.trigger.seconds).toBe(2);
    });

    it('tags the notification data with type: activity_complete', async () => {
        await notifyActivityComplete('Reaction Board Challenge');
        const call = mockSchedule.mock.calls[0][0];
        expect(call.content.data.type).toBe('activity_complete');
        expect(call.content.data.activityName).toBe('Reaction Board Challenge');
    });
});

// ─── notifyActivityReminder ───────────────────────────────────────

describe('notifyActivityReminder', () => {
    it('schedules a reminder with a 60-second delay', async () => {
        await notifyActivityReminder('Hand Fan Challenge');
        expect(mockSchedule).toHaveBeenCalledTimes(1);
        const call = mockSchedule.mock.calls[0][0];
        expect(call.trigger.seconds).toBe(60);
        expect(call.content.body).toContain('Hand Fan Challenge');
    });
});

// ─── cancelAllNotifications ───────────────────────────────────────

describe('cancelAllNotifications', () => {
    it('calls cancelAllScheduledNotificationsAsync', async () => {
        await cancelAllNotifications();
        expect(mockCancelAll).toHaveBeenCalledTimes(1);
    });
});
