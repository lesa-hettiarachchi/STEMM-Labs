/**
 * Activity Context — Session State for Activity Flow
 * Tracks current activity session: readings, data table, ratings
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { SensorReading, DataTableRow, ActivityAttempt } from '@/constants/types';
import { getActivityById } from '@/constants/activities';
import { saveAttempt, upsertLeaderboardEntry } from '@/services/firestore';
import { saveAttemptLocal, markAttemptSynced } from '@/services/database';
import { getCurrentLocation } from '@/services/location';
import { useTeam } from '@/context/TeamContext';

// ─── Leaderboard score derivation ────────────────────────────────
// Each activity produces a numeric score so the leaderboard can rank teams.
// Higher score = better performance in all cases.

function deriveBestScore(
  activityId: string,
  calcParams: Record<string, number>,
  sensorReadings: SensorReading[],
  rating: number,
  dataTableRows: DataTableRow[] = []
): { score: number; unit: string } {
  switch (activityId) {
    case 'parachute-drop': {
      // Tier 2: all 3 designs are rows of the data table.  Best = longest drop time.
      const times = dataTableRows
        .map((r) => parseFloat(r.actual ?? ''))
        .filter((t) => Number.isFinite(t) && t > 0);
      const best = times.length > 0 ? Math.max(...times) : 0;
      return { score: Math.round(best * 100), unit: 'cs' };
    }
    case 'sound-pollution': {
      // Peak dB recorded by the team (highest reading saved = score).
      const dbs = sensorReadings.filter((r) => r.sensorType === 'microphone').map((r) => r.value);
      return { score: dbs.length > 0 ? Math.round(Math.max(...dbs)) : 0, unit: 'dB' };
    }
    case 'hand-fan': {
      // Tier 2: take the largest measured bend angle across all 3 design rows.
      const angles = dataTableRows
        .map((r) => parseFloat(r.outcome ?? ''))
        .filter((a) => Number.isFinite(a) && a > 0);
      const best = angles.length > 0 ? Math.max(...angles) : 0;
      return { score: Math.round(best), unit: '°' };
    }
    case 'earthquake-structure': {
      // Tier 2: pick the lowest peak amplitude across all 3 design rows
      // (most stable wins).  Score = 100 − amplitude × 10, clamped 0–100.
      const amplitudes = dataTableRows
        .map((r) => parseFloat(r.outcome ?? ''))
        .filter((a) => Number.isFinite(a) && a >= 0);
      const lowest = amplitudes.length > 0 ? Math.min(...amplitudes) : 10;
      const score = Math.max(0, Math.min(100, Math.round(100 - lowest * 10)));
      return { score, unit: 'pts' };
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

    // GPS: capped at 4s by getCurrentLocation — returns null if offline / slow
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

    // ─── OFFLINE-FIRST WRITE ORDER ─────────────────────────────
    // 1. SQLite (synchronous, always succeeds)            → source of truth
    // 2. AsyncStorage progress (synchronous, fast)         → for splash/home
    // 3. Firestore (fire-and-forget, queues if offline)    → cloud sync
    // 4. Mark SQLite row synced=1 when Firestore confirms  → backfill on reconnect
    // ───────────────────────────────────────────────────────────

    // 1. Always save to SQLite first — this is the primary store
    await saveAttemptLocal(attempt).catch((err) =>
      console.warn('SQLite save failed:', err)
    );

    // Derive leaderboard score from actual sensor/calc/table data
    const { score, unit } = deriveBestScore(
      session.activityId,
      session.calcParams,
      session.sensorReadings,
      session.rating,
      session.dataTableRows
    );

    // 2. Update local activity progress (AsyncStorage)
    // Use the activity definition for maxIterations rather than hardcoding 3,
    // so activities with maxIterations: 1 (sound, reaction, breathing) correctly
    // mark completed on the first save and don't keep incrementing.
    const activityDef = getActivityById(session.activityId);
    const maxIterations = activityDef?.maxIterations ?? 1;

    const updatedProgress = { ...activityProgress };
    const prevBest = activityProgress[session.activityId]?.bestScore;
    const newBest = prevBest !== undefined ? Math.max(prevBest, score) : score;

    const justCompleted = session.iteration; // 1-based iteration that was just saved
    const isLastIteration = justCompleted >= maxIterations;
    // Cap currentIteration at maxIterations so the UI doesn't show "Iteration 4 of 3"
    const nextIteration = Math.min(justCompleted + 1, maxIterations);

    updatedProgress[session.activityId] = {
      status: isLastIteration ? 'completed' : 'in_progress',
      currentIteration: nextIteration,
      bestScore: newBest,
      bestScoreUnit: unit,
    };

    await updateActivityProgress(updatedProgress);

    // 3. Fire-and-forget Firestore push.  Firebase SDK queues offline writes,
    //    so calling this is safe even with no connection — the write goes out
    //    when network returns.  When it succeeds we flag the SQLite row.
    saveAttempt(attempt)
      .then(() => markAttemptSynced(attempt.id).catch(() => {}))
      .catch((err) => console.warn('Firestore save queued/failed:', err));

    // Push leaderboard entry (Firestore handles offline queuing here too).
    // Note: upsertLeaderboardEntry strips undefined fields before write,
    // so optional fields like schoolName are handled correctly.
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
    }).catch((err) => console.warn('[Leaderboard] upsert failed:', err));

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
