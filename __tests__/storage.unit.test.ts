import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Team } from '../constants/types';
import {
    clearAllData,
    clearTeamProfile,
    getActivityProgress,
    getSettings,
    getTeamProfile,
    saveActivityProgress,
    saveSettings,
    saveTeamProfile,
} from '../services/storage';

jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

const mockTeam: Team = {
    id: 'team-001',
    name: 'Alpha Squad',
    discriminator: '1234',
    gradeLevel: 'Year 9',
    schoolName: 'STEMM High',
    createdAt: 1700000000000,
    members: [
        { id: 'm1', firstName: 'Alex' },
        { id: 'm2', firstName: 'Jordan' },
    ],
};

beforeEach(async () => {
    await AsyncStorage.clear();
});

// ─── Team Profile ────────────────────────────────────────────────

describe('saveTeamProfile / getTeamProfile', () => {
    it('saves and retrieves a team profile', async () => {
        await saveTeamProfile(mockTeam);
        const retrieved = await getTeamProfile();
        expect(retrieved).not.toBeNull();
        expect(retrieved!.name).toBe('Alpha Squad');
        expect(retrieved!.members).toHaveLength(2);
    });

    it('returns null when no profile is saved', async () => {
        const result = await getTeamProfile();
        expect(result).toBeNull();
    });

    it('overwrites an existing profile', async () => {
        await saveTeamProfile(mockTeam);
        await saveTeamProfile({ ...mockTeam, name: 'Beta Squad' });
        const result = await getTeamProfile();
        expect(result!.name).toBe('Beta Squad');
    });
});

describe('clearTeamProfile', () => {
    it('removes the team profile from storage', async () => {
        await saveTeamProfile(mockTeam);
        await clearTeamProfile();
        const result = await getTeamProfile();
        expect(result).toBeNull();
    });
});

// ─── Settings ────────────────────────────────────────────────────

describe('saveSettings / getSettings', () => {
    it('returns default settings when nothing is saved', async () => {
        const settings = await getSettings();
        expect(settings.themeMode).toBe('system');
        expect(settings.textSizeMultiplier).toBe(1.0);
    });

    it('saves and retrieves custom settings', async () => {
        await saveSettings({ themeMode: 'dark', textSizeMultiplier: 1.25 });
        const settings = await getSettings();
        expect(settings.themeMode).toBe('dark');
        expect(settings.textSizeMultiplier).toBe(1.25);
    });

    it('merges saved settings with defaults (partial save)', async () => {
        await AsyncStorage.setItem('@stemm_settings', JSON.stringify({ themeMode: 'light' }));
        const settings = await getSettings();
        expect(settings.themeMode).toBe('light');
        expect(settings.textSizeMultiplier).toBe(1.0); // default preserved
    });
});

// ─── Activity Progress ──────────────────────────────────────────

describe('saveActivityProgress / getActivityProgress', () => {
    it('returns empty object when nothing is saved', async () => {
        const progress = await getActivityProgress();
        expect(progress).toEqual({});
    });

    it('saves and retrieves activity progress', async () => {
        const progress = {
            'parachute-drop': {
                status: 'completed' as const,
                currentIteration: 3,
                bestScore: 87,
                bestScoreUnit: 'pts',
            },
        };
        await saveActivityProgress(progress);
        const result = await getActivityProgress();
        expect(result['parachute-drop'].status).toBe('completed');
        expect(result['parachute-drop'].bestScore).toBe(87);
    });
});

// ─── clearAllData ────────────────────────────────────────────────

describe('clearAllData', () => {
    it('removes team, settings, and activity progress', async () => {
        await saveTeamProfile(mockTeam);
        await saveSettings({ themeMode: 'dark', textSizeMultiplier: 1.5 });
        await saveActivityProgress({
            'sound-pollution': { status: 'in_progress', currentIteration: 1 },
        });

        await clearAllData();

        expect(await getTeamProfile()).toBeNull();
        const settings = await getSettings();
        expect(settings.themeMode).toBe('system'); // back to default
        expect(await getActivityProgress()).toEqual({});
    });
});
