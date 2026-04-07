/**
 * useSensorData — Unified sensor hook per activity
 * Selects the correct sensor service based on activityId,
 * returns a unified API for starting/stopping + collecting readings.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { getActivityById } from '@/constants/activities';
import type { SensorReading } from '@/constants/types';
import { createAccelerometerService, AccelerometerReading } from '@/services/sensors/accelerometer';
import { createAudioService, AudioReading } from '@/services/sensors/audio';
import { createTimer, TimerState } from '@/services/sensors/timer';

export interface SensorData {
  isActive: boolean;
  currentReading: SensorReading | null;
  readings: SensorReading[];
  rawAccel: AccelerometerReading | null;
  rawAudio: AudioReading | null;
  timerState: TimerState | null;
  peakValue: number;
  averageValue: number;
  start: () => Promise<void>;
  stop: () => void;
  saveReading: () => void;
  clearReadings: () => void;
  getSmoothnessScore: () => number;
  getBreathsPerMinute: (durationSeconds: number) => number;
}

function toSensorReading(
  sensorType: string,
  value: number,
  unit: string
): SensorReading {
  return {
    id: `${sensorType}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    sensorType,
    value,
    unit,
    timestamp: Date.now(),
  };
}

export function useSensorData(activityId: string): SensorData {
  const activity = getActivityById(activityId);
  const sensorType = activity?.sensorType ?? 'timer';

  const [isActive, setIsActive] = useState(false);
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [currentReading, setCurrentReading] = useState<SensorReading | null>(null);
  const [rawAccel, setRawAccel] = useState<AccelerometerReading | null>(null);
  const [rawAudio, setRawAudio] = useState<AudioReading | null>(null);
  const [timerState, setTimerState] = useState<TimerState | null>(null);
  const [peakValue, setPeakValue] = useState(0);

  const accelRef = useRef(createAccelerometerService());
  const audioRef = useRef(createAudioService());
  const timerRef = useRef(createTimer());

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      accelRef.current.cleanup();
      audioRef.current.cleanup();
      timerRef.current.cleanup();
    };
  }, []);

  const start = useCallback(async () => {
    setIsActive(true);

    switch (sensorType) {
      case 'accelerometer': {
        const accel = accelRef.current;
        accel.setOnReading((reading) => {
          setRawAccel(reading);

          // Pick the reading type based on activity
          let value: number;
          let unit: string;
          if (activityId === 'hand-fan') {
            value = reading.bendAngleDeg;
            unit = '°';
          } else if (activityId === 'breathing-pace') {
            value = reading.z; // z-axis for chest movement
            unit = 'g';
          } else if (activityId === 'human-performance') {
            value = reading.vibrationMagnitude;
            unit = 'm/s²';
          } else {
            // earthquake-structure
            value = reading.vibrationAmplitudeMm;
            unit = 'mm';
          }

          const sr = toSensorReading(sensorType, value, unit);
          setCurrentReading(sr);
          if (value > peakValue) setPeakValue(value);
        });
        await accel.start(100);
        break;
      }

      case 'microphone': {
        const audio = audioRef.current;
        audio.setOnReading((reading) => {
          setRawAudio(reading);
          const sr = toSensorReading('microphone', reading.approxDb, 'dB');
          setCurrentReading(sr);
          if (reading.approxDb > peakValue) setPeakValue(reading.approxDb);
        });
        await audio.start(200);
        break;
      }

      case 'timer': {
        const timer = timerRef.current;
        timer.setOnUpdate((state) => {
          setTimerState(state);
          const seconds = Math.round(state.elapsedMs) / 1000;
          setCurrentReading(toSensorReading('timer', seconds, 's'));
        });
        timer.start();
        break;
      }

      case 'touchscreen':
        // Reaction board is handled by the component directly
        break;

      case 'camera':
        // Camera is handled by the camera screen directly
        break;
    }
  }, [sensorType, activityId, peakValue]);

  const stop = useCallback(() => {
    setIsActive(false);

    switch (sensorType) {
      case 'accelerometer':
        accelRef.current.stop();
        break;
      case 'microphone':
        audioRef.current.stop();
        break;
      case 'timer':
        timerRef.current.stop();
        break;
    }
  }, [sensorType]);

  const saveReading = useCallback(() => {
    if (currentReading) {
      setReadings((prev) => [...prev, currentReading]);
    }
  }, [currentReading]);

  const clearReadings = useCallback(() => {
    setReadings([]);
    setCurrentReading(null);
    setPeakValue(0);
    accelRef.current.clearReadings();
    audioRef.current.clearReadings();
    timerRef.current.reset();
    setTimerState(null);
  }, []);

  const getSmoothnessScore = useCallback(() => {
    return accelRef.current.getSmoothnessScore();
  }, []);

  const getBreathsPerMinute = useCallback((durationSeconds: number) => {
    return accelRef.current.getBreathsPerMinute(durationSeconds);
  }, []);

  const averageValue =
    readings.length > 0
      ? Math.round(
          (readings.reduce((s, r) => s + r.value, 0) / readings.length) * 100
        ) / 100
      : 0;

  return {
    isActive,
    currentReading,
    readings,
    rawAccel,
    rawAudio,
    timerState,
    peakValue,
    averageValue,
    start,
    stop,
    saveReading,
    clearReadings,
    getSmoothnessScore,
    getBreathsPerMinute,
  };
}
