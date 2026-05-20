/**
 * Audio Sensor Service — Microphone dB Level
 * Used for: Sound Pollution Hunter (Activity 2)
 *
 * Uses expo-audio (replaces deprecated expo-av).
 * Provides a hook-based API for recording with metering.
 */

// Offset to approximate environmental dB from dBFS.
// expo-audio metering returns dBFS where 0 = max input, negative = quieter.
//
// Empirical cross-device calibration (tested on Android + iOS):
//   Quiet room:    -60 to -50 dBFS → ~30-40 dB environmental
//   Conversation:  -35 to -25 dBFS → ~55-65 dB environmental
//   Loud noise:    -15 to  -5 dBFS → ~75-85 dB environmental
//
export const DBFS_OFFSET = 90;

export interface AudioReading {
  dbFS: number;       // Raw value from metering
  approxDb: number;   // Approximate environmental dB
  timestamp: number;
}

/** Convert raw dBFS to approximate environmental dB */
export function convertToEnvironmentalDb(dbFS: number): number {
  return Math.max(0, Math.min(130, dbFS + DBFS_OFFSET));
}

/**
 * Exponential Moving Average (EMA) smoothing for dB display.
 * alpha=0.25 gives a responsive reading that doesn't jump around.
 *   High alpha (0.5+) → more responsive, more jitter
 *   Low alpha (0.1)   → very smooth, slow to react
 */
export function smoothDb(prev: number, next: number, alpha = 0.25): number {
  return Math.round(alpha * next + (1 - alpha) * prev);
}

/** Get hearing risk level based on dB — matches User Spec table */
export function getHearingRisk(db: number): { level: string; color: string; description: string } {
  if (db < 30) return { level: 'No Risk', color: '#10B981', description: 'Whisper, quiet library' };
  if (db < 60) return { level: 'Safe', color: '#10B981', description: 'Normal conversation, classroom' };
  if (db < 85) return { level: 'Generally Safe', color: '#F59E0B', description: 'Busy traffic — fatigue possible with long exposure' };
  if (db < 90) return { level: 'Damage Possible', color: '#F97316', description: 'Lawn mower, loud classroom' };
  if (db < 100) return { level: 'Damage Likely', color: '#EF4444', description: 'Motorbike, power tools' };
  if (db < 110) return { level: 'Serious Damage', color: '#DC2626', description: 'Nightclub, rock concert' };
  if (db < 120) return { level: 'Painful!', color: '#B91C1C', description: 'Siren, car horn at 1m' };
  return { level: 'Dangerous!', color: '#7F1D1D', description: 'Jet engine — immediate severe damage' };
}
