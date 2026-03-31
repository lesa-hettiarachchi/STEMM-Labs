/**
 * AsyncStorage Local Persistence
 */

import type { Team } from '@/constants/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
    TEAM_PROFILE: '@stemm_team_profile',
    SETTINGS: '@stemm_settings',
    ACTIVITY_PROGRESS: '@stemm_activity_progress',
} as const;

// ─── Team Profile ────────────────────────────────────────────────

export async function saveTeamProfile(team: Team): Promise<void> {
    await AsyncStorage.setItem(KEYS.TEAM_PROFILE, JSON.stringify(team));
}

export async function getTeamProfile(): Promise<Team | null> {
    const json = await AsyncStorage.getItem(KEYS.TEAM_PROFILE);
    return json ? JSON.parse(json) : null;
}

export async function hasTeamProfile(): Promise<boolean> {
    const json = await AsyncStorage.getItem(KEYS.TEAM_PROFILE);
    return json !== null;
}

export async function clearTeamProfile(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.TEAM_PROFILE);
}

// ─── Settings ────────────────────────────────────────────────────

export interface AppSettings {
    themeMode: 'system' | 'light' | 'dark';
    textSizeMultiplier: number; // 1.0, 1.25, 1.5
}

const DEFAULT_SETTINGS: AppSettings = {
    themeMode: 'system',
    textSizeMultiplier: 1.0,
};

export async function saveSettings(settings: AppSettings): Promise<void> {
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

export async function getSettings(): Promise<AppSettings> {
    const json = await AsyncStorage.getItem(KEYS.SETTINGS);
    return json ? { ...DEFAULT_SETTINGS, ...JSON.parse(json) } : DEFAULT_SETTINGS;
}

// ─── Activity Progress ──────────────────────────────────────────

export interface ActivityProgress {
    [activityId: string]: {
        status: 'not_started' | 'in_progress' | 'completed';
        currentIteration: number;
        bestScore?: number;
        bestScoreUnit?: string;
    };
}

export async function saveActivityProgress(
    progress: ActivityProgress
): Promise<void> {
    await AsyncStorage.setItem(
        KEYS.ACTIVITY_PROGRESS,
        JSON.stringify(progress)
    );
}

export async function getActivityProgress(): Promise<ActivityProgress> {
    const json = await AsyncStorage.getItem(KEYS.ACTIVITY_PROGRESS);
    return json ? JSON.parse(json) : {};
}

// ─── Clear All ───────────────────────────────────────────────────

export async function clearAllData(): Promise<void> {
    await AsyncStorage.multiRemove([
        KEYS.TEAM_PROFILE,
        KEYS.SETTINGS,
        KEYS.ACTIVITY_PROGRESS,
    ]);
}
