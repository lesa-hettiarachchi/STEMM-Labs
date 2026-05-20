import type { Team } from '@/constants/types';
import {
    ActivityProgress,
    clearTeamProfile,
    getActivityProgress,
    getTeamProfile,
    saveActivityProgress,
    saveTeamProfile,
} from '@/services/storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface TeamContextValue {
    team: Team | null;
    activityProgress: ActivityProgress;
    isLoading: boolean;
    isRegistered: boolean;
    setTeam: (team: Team) => Promise<void>;
    updateTeam: (updates: Partial<Team>) => Promise<void>;
    updateActivityProgress: (progress: ActivityProgress) => Promise<void>;
    clearTeam: () => Promise<void>;
}

const TeamContext = createContext<TeamContextValue>({
    team: null,
    activityProgress: {},
    isLoading: true,
    isRegistered: false,
    setTeam: async () => { },
    updateTeam: async () => { },
    updateActivityProgress: async () => { },
    clearTeam: async () => { },
});

export function TeamProvider({ children }: { children: React.ReactNode }) {
    const [team, setTeamState] = useState<Team | null>(null);
    const [activityProgress, setProgressState] = useState<ActivityProgress>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        Promise.all([getTeamProfile(), getActivityProgress()]).then(
            ([t, p]) => {
                setTeamState(t);
                setProgressState(p);
                setIsLoading(false);
            }
        );
    }, []);

    const setTeam = async (t: Team) => {
        setTeamState(t);
        await saveTeamProfile(t);
    };

    const updateTeam = async (updates: Partial<Team>) => {
        if (!team) return;
        const updated = { ...team, ...updates };
        setTeamState(updated);
        await saveTeamProfile(updated);
    };

    const updateActivityProgress = async (progress: ActivityProgress) => {
        setProgressState(progress);
        await saveActivityProgress(progress);
    };

    const clearTeam = async () => {
        setTeamState(null);
        setProgressState({});
        await clearTeamProfile();
    };

    return (
        <TeamContext.Provider
            value={{
                team,
                activityProgress,
                isLoading,
                isRegistered: team !== null,
                setTeam,
                updateTeam,
                updateActivityProgress,
                clearTeam,
            }}
        >
            {children}
        </TeamContext.Provider>
    );
}

export function useTeam() {
    return useContext(TeamContext);
}
