/**
 * Activity Context — Session State for Activity Flow
 * Tracks current activity session: readings, data table, ratings
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { SensorReading, DataTableRow, ActivityAttempt } from '@/constants/types';
import { saveAttempt, upsertLeaderboardEntry } from '@/services/firestore';
import { getCurrentLocation } from '@/services/location';
import { useTeam } from '@/context/TeamContext';

interface ActivitySession {
  activityId: string;
  iteration: number;
  sensorReadings: SensorReading[];
  dataTableRows: DataTableRow[];
  rating: number;
  comment: string;
  startedAt: number;
  /** Params for calculations (activity-specific key-value) */
  calcParams: Record<string, number>;
}

interface ActivityContextValue {
  session: ActivitySession | null;
  startSession: (activityId: string, iteration: number) => void;
  addSensorReading: (reading: SensorReading) => void;
  setSensorReadings: (readings: SensorReading[]) => void;
  setDataTableRows: (rows: DataTableRow[]) => void;
  setRating: (rating: number) => void;
  setComment: (comment: string) => void;
  setCalcParam: (key: string, value: number) => void;
  setCalcParams: (params: Record<string, number>) => void;
  saveSession: () => Promise<ActivityAttempt | null>;
  clearSession: () => void;
}

const ActivityContext = createContext<ActivityContextValue>({
  session: null,
  startSession: () => {},
  addSensorReading: () => {},
  setSensorReadings: () => {},
  setDataTableRows: () => {},
  setRating: () => {},
  setComment: () => {},
  setCalcParam: () => {},
  setCalcParams: () => {},
  saveSession: async () => null,
  clearSession: () => {},
});

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function ActivityProvider({ children }: { children: React.ReactNode }) {
  const { team, activityProgress, updateActivityProgress } = useTeam();
  const [session, setSession] = useState<ActivitySession | null>(null);

  const startSession = useCallback((activityId: string, iteration: number) => {
    setSession({
      activityId,
      iteration,
      sensorReadings: [],
      dataTableRows: [],
      rating: 0,
      comment: '',
      startedAt: Date.now(),
      calcParams: {},
    });
  }, []);

  const addSensorReading = useCallback((reading: SensorReading) => {
    setSession((prev) =>
      prev ? { ...prev, sensorReadings: [...prev.sensorReadings, reading] } : prev
    );
  }, []);

  const setSensorReadings = useCallback((readings: SensorReading[]) => {
    setSession((prev) => (prev ? { ...prev, sensorReadings: readings } : prev));
  }, []);

  const setDataTableRows = useCallback((rows: DataTableRow[]) => {
    setSession((prev) => (prev ? { ...prev, dataTableRows: rows } : prev));
  }, []);

  const setRating = useCallback((rating: number) => {
    setSession((prev) => (prev ? { ...prev, rating } : prev));
  }, []);

  const setComment = useCallback((comment: string) => {
    setSession((prev) => (prev ? { ...prev, comment } : prev));
  }, []);

  const setCalcParam = useCallback((key: string, value: number) => {
    setSession((prev) =>
      prev ? { ...prev, calcParams: { ...prev.calcParams, [key]: value } } : prev
    );
  }, []);

  const setCalcParams = useCallback((params: Record<string, number>) => {
    setSession((prev) =>
      prev ? { ...prev, calcParams: { ...prev.calcParams, ...params } } : prev
    );
  }, []);

  const saveSession = useCallback(async (): Promise<ActivityAttempt | null> => {
    if (!session || !team) return null;

    // Get GPS coordinates (non-blocking if denied)
    const location = await getCurrentLocation().catch(() => null);

    const attempt: ActivityAttempt = {
      id: generateId(),
      teamId: team.id,
      activityId: session.activityId,
      iteration: session.iteration,
      sensorReadings: session.sensorReadings,
      dataTableRows: session.dataTableRows,
      rating: session.rating,
      comment: session.comment,
      gpsLatitude: location?.latitude,
      gpsLongitude: location?.longitude,
      startedAt: session.startedAt,
      completedAt: Date.now(),
    };

    // Save to Firestore (non-blocking)
    saveAttempt(attempt).catch((err) =>
      console.warn('Failed to save attempt to Firestore:', err)
    );

    // Update local activity progress
    const updatedProgress = { ...activityProgress };
    const isLastIteration =
      session.iteration >= 3; // Most activities have 3 max iterations

    updatedProgress[session.activityId] = {
      status: isLastIteration ? 'completed' : 'in_progress',
      currentIteration: session.iteration + 1,
      bestScore: session.calcParams.bestScore,
      bestScoreUnit: undefined,
    };

    await updateActivityProgress(updatedProgress);

    // Update leaderboard if there's a score
    if (session.calcParams.bestScore && team) {
      upsertLeaderboardEntry({
        id: '',
        teamId: team.id,
        teamName: team.name,
        teamDiscriminator: team.discriminator,
        schoolName: team.schoolName,
        gradeLevel: team.gradeLevel,
        activityId: session.activityId,
        bestScore: session.calcParams.bestScore,
        bestScoreUnit: session.calcParams.bestScoreUnit?.toString() ?? '',
        dateAchieved: Date.now(),
      }).catch(console.warn);
    }

    return attempt;
  }, [session, team, activityProgress, updateActivityProgress]);

  const clearSession = useCallback(() => {
    setSession(null);
  }, []);

  return (
    <ActivityContext.Provider
      value={{
        session,
        startSession,
        addSensorReading,
        setSensorReadings,
        setDataTableRows,
        setRating,
        setComment,
        setCalcParam,
        setCalcParams,
        saveSession,
        clearSession,
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivity() {
  return useContext(ActivityContext);
}
