/**
 * Activity Context — Session State for Activity Flow
 * Tracks current activity session: readings, data table, ratings
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { SensorReading, DataTableRow, ActivityAttempt } from '@/constants/types';
import { saveAttempt, upsertLeaderboardEntry } from '@/services/firestore';
import { getCurrentLocation } from '@/services/location';
import { useTeam } from '@/context/TeamContext';

// ─── Leaderboard score derivation ────────────────────────────────
// Each activity produces a numeric score so the leaderboard can rank teams.
// Higher score = better performance in all cases.

function deriveBestScore(
  activityId: string,
  calcParams: Record<string, number>,
  sensorReadings: SensorReading[],
  rating: number
): { score: number; unit: string } {
  switch (activityId) {
    case 'parachute-drop': {
      // Longer hang-time = better parachute. Store as centiseconds (integer-friendly).
      const t = calcParams.time ?? 0;
      return { score: Math.round(t * 100), unit: 'cs' };
    }
    case 'sound-pollution': {
      // Peak dB recorded by the team (highest reading saved = score).
      const dbs = sensorReadings.filter((r) => r.sensorType === 'microphone').map((r) => r.value);
      return { score: dbs.length > 0 ? Math.round(Math.max(...dbs)) : 0, unit: 'dB' };
    }
    case 'hand-fan': {
      // Largest measured bend angle = best fan performance.
      return { score: Math.round(calcParams.angle ?? 0), unit: '°' };
    }
    case 'earthquake-structure': {
      // Lower vibration amplitude = more stable structure → invert to score.
      const amp = calcParams.peakAmplitude ?? 50;
      return { score: Math.max(0, Math.round(100 - amp)), unit: 'pts' };
    }
    case 'human-performance': {
      // Smoothness score 0-100 from the accelerometer.
      return { score: Math.round(calcParams.smoothness ?? 0), unit: 'pts' };
    }
    case 'reaction-board': {
      // Faster reaction = better. Map 0–1000 ms to 1000–0 pts.
      const best = calcParams.bestReaction ?? 500;
      return { score: Math.max(0, Math.round(1000 - best)), unit: 'pts' };
    }
    case 'breathing-pace': {
      // Use star rating as proxy (breathing data doesn't have a single "best" value).
      return { score: rating * 20, unit: 'pts' };
    }
    default:
      return { score: rating * 20, unit: 'pts' };
  }
}

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

    // Derive leaderboard score from actual sensor/calc data
    const { score, unit } = deriveBestScore(
      session.activityId,
      session.calcParams,
      session.sensorReadings,
      session.rating
    );

    // Update local activity progress
    const updatedProgress = { ...activityProgress };
    const prevBest = activityProgress[session.activityId]?.bestScore;
    const newBest = prevBest !== undefined ? Math.max(prevBest, score) : score;

    const isLastIteration = session.iteration >= 3;

    updatedProgress[session.activityId] = {
      status: isLastIteration ? 'completed' : 'in_progress',
      currentIteration: session.iteration + 1,
      bestScore: newBest,
      bestScoreUnit: unit,
    };

    await updateActivityProgress(updatedProgress);

    // Always push to leaderboard (upsertLeaderboardEntry only keeps the best)
    if (team) {
      upsertLeaderboardEntry({
        id: '',
        teamId: team.id,
        teamName: team.name,
        teamDiscriminator: team.discriminator,
        schoolName: team.schoolName,
        gradeLevel: team.gradeLevel,
        activityId: session.activityId,
        bestScore: score,
        bestScoreUnit: unit,
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
