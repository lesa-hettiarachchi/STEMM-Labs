import { Accelerometer, AccelerometerMeasurement } from 'expo-sensors';

export interface AccelerometerReading {
  x: number;
  y: number;
  z: number;
  timestamp: number;
  vibrationMagnitude: number;
  vibrationAmplitudeMm: number;
  bendAngleDeg: number;
}

const GRAVITY = 9.81;

function processReading(data: AccelerometerMeasurement): AccelerometerReading {
  const { x, y, z } = data;
  const timestamp = Date.now();

  // Total acceleration magnitude
  const totalAccel = Math.sqrt(x * x + y * y + z * z);

  // Vibration = deviation from 1g (gravity-normalised sensor data)
  // Expo returns values in g-units (1g ≈ 9.81 m/s²)
  const vibrationG = Math.abs(totalAccel - 1.0);
  const vibrationMagnitude = vibrationG * GRAVITY; // Convert to m/s²

  // Vibration amplitude in mm (rough approximation: a = ω²A → A ≈ a/ω², assume ω≈10 rad/s)
  const vibrationAmplitudeMm = Math.round(vibrationMagnitude * 10 * 100) / 100;

  // Bend angle from vertical: angle between acceleration vector and z-axis
  const bendAngleRad = Math.atan2(Math.sqrt(x * x + y * y), Math.abs(z));
  const bendAngleDeg = Math.round((bendAngleRad * 180) / Math.PI * 10) / 10;

  return {
    x,
    y,
    z,
    timestamp,
    vibrationMagnitude: Math.round(vibrationMagnitude * 1000) / 1000,
    vibrationAmplitudeMm,
    bendAngleDeg,
  };
}

export function createAccelerometerService() {
  let subscription: ReturnType<typeof Accelerometer.addListener> | null = null;
  let onReading: ((reading: AccelerometerReading) => void) | null = null;
  let readings: AccelerometerReading[] = [];
  let latestReading: AccelerometerReading | null = null;

  return {
    async start(intervalMs: number = 100) {
      const { status } = await Accelerometer.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Accelerometer permission denied');
      }

      Accelerometer.setUpdateInterval(intervalMs);

      subscription = Accelerometer.addListener((data) => {
        const reading = processReading(data);
        latestReading = reading;
        readings.push(reading);

        // Keep at most 600 readings (~1 minute at 100ms interval)
        if (readings.length > 600) {
          readings = readings.slice(-600);
        }

        if (onReading) onReading(reading);
      });
    },

    stop() {
      if (subscription) {
        subscription.remove();
        subscription = null;
      }
    },

    getLatest(): AccelerometerReading | null {
      return latestReading;
    },

    getReadings(): AccelerometerReading[] {
      return [...readings];
    },

    clearReadings() {
      readings = [];
      latestReading = null;
    },

    setOnReading(callback: (reading: AccelerometerReading) => void) {
      onReading = callback;
    },

    /** Compute smoothness score: 100 = perfectly smooth, 0 = very shaky */
    getSmoothnessScore(): number {
      if (readings.length < 10) return 100;
      const recent = readings.slice(-50);
      const avgVibration =
        recent.reduce((sum, r) => sum + r.vibrationMagnitude, 0) / recent.length;
      // Score: low vibration = high smoothness (capped at 0–100)
      const score = Math.max(0, Math.min(100, 100 - avgVibration * 20));
      return Math.round(score);
    },

    /** Count breathing cycles from z-axis peaks over a duration */
    getBreathsPerMinute(durationSeconds: number): number {
      if (readings.length < 20 || durationSeconds <= 0) return 0;

      // Look at z-axis values, find peaks (local maxima)
      const zValues = readings.map((r) => r.z);
      let peaks = 0;
      for (let i = 1; i < zValues.length - 1; i++) {
        if (zValues[i] > zValues[i - 1] && zValues[i] > zValues[i + 1]) {
          // Only count significant peaks (threshold: 0.02g deviation)
          const avg = (zValues[i - 1] + zValues[i + 1]) / 2;
          if (zValues[i] - avg > 0.02) {
            peaks++;
          }
        }
      }

      // Scale to breaths per minute
      return Math.round((peaks / durationSeconds) * 60);
    },

    /** Get peak vibration amplitude from all readings */
    getPeakVibration(): number {
      if (readings.length === 0) return 0;
      return Math.max(...readings.map((r) => r.vibrationAmplitudeMm));
    },

    cleanup() {
      this.stop();
      readings = [];
      latestReading = null;
      onReading = null;
    },
  };
}
