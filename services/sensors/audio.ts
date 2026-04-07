/**
 * Audio Sensor Service — Microphone dB Level
 * Used for: Sound Pollution Hunter (Activity 2)
 * 
 * Note: Expo AV provides metering in dBFS (relative to full scale).
 * We approximate environmental dB by adding an offset.
 */

import { Audio } from 'expo-av';

export interface AudioReading {
  dbFS: number;       // Raw value from Expo AV metering
  approxDb: number;   // Approximate environmental dB
  timestamp: number;
}

// Rough offset to approximate environmental dB from dBFS.
// Expo AV metering returns dBFS where 0 = max input, negative = quieter.
// Typical device readings:
//   Quiet room: -50 to -60 dBFS → should be ~40-50 dB environmental
//   Conversation: -25 to -35 dBFS → should be ~65-75 dB
//   Loud noise: -10 dBFS → should be ~90 dB
// Using offset of 100 gives the most realistic mapping.
const DBFS_OFFSET = 100;

export function createAudioService() {
  let recording: Audio.Recording | null = null;
  let intervalId: ReturnType<typeof setInterval> | null = null;
  let onReading: ((reading: AudioReading) => void) | null = null;
  let readings: AudioReading[] = [];
  let latestReading: AudioReading | null = null;
  let peakDb = 0;

  return {
    async start(intervalMs: number = 200) {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        throw new Error('Microphone permission denied');
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        isMeteringEnabled: true,
      });
      await recording.startAsync();

      // Poll metering at intervals
      intervalId = setInterval(async () => {
        if (!recording) return;
        try {
          const status = await recording.getStatusAsync();
          if (status.isRecording && status.metering !== undefined) {
            const dbFS = status.metering;
            const approxDb = Math.max(0, Math.min(130, dbFS + DBFS_OFFSET));
            const timestamp = Date.now();

            const reading: AudioReading = { dbFS, approxDb, timestamp };
            latestReading = reading;
            readings.push(reading);

            if (approxDb > peakDb) peakDb = approxDb;

            // Keep max 300 readings (~1 minute at 200ms)
            if (readings.length > 300) {
              readings = readings.slice(-300);
            }

            if (onReading) onReading(reading);
          }
        } catch {
          // Recording may have been stopped
        }
      }, intervalMs);
    },

    async stop() {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      if (recording) {
        try {
          await recording.stopAndUnloadAsync();
        } catch {
          // Already stopped
        }
        recording = null;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
    },

    getLatest(): AudioReading | null {
      return latestReading;
    },

    getReadings(): AudioReading[] {
      return [...readings];
    },

    getPeakDb(): number {
      return Math.round(peakDb * 10) / 10;
    },

    getAverageDb(): number {
      if (readings.length === 0) return 0;
      const sum = readings.reduce((s, r) => s + r.approxDb, 0);
      return Math.round((sum / readings.length) * 10) / 10;
    },

    /** Get hearing risk level based on dB — matches User Spec table */
    getHearingRisk(db: number): { level: string; color: string; description: string } {
      if (db < 30) return { level: 'No Risk', color: '#10B981', description: 'Whisper, quiet library' };
      if (db < 60) return { level: 'Safe', color: '#10B981', description: 'Normal conversation, classroom' };
      if (db < 85) return { level: 'Generally Safe', color: '#F59E0B', description: 'Busy traffic — fatigue possible with long exposure' };
      if (db < 90) return { level: 'Damage Possible', color: '#F97316', description: 'Lawn mower, loud classroom' };
      if (db < 100) return { level: 'Damage Likely', color: '#EF4444', description: 'Motorbike, power tools' };
      if (db < 110) return { level: 'Serious Damage', color: '#DC2626', description: 'Nightclub, rock concert' };
      if (db < 120) return { level: 'Painful!', color: '#B91C1C', description: 'Siren, car horn at 1m' };
      return { level: 'Dangerous!', color: '#7F1D1D', description: 'Jet engine — immediate severe damage' };
    },

    clearReadings() {
      readings = [];
      latestReading = null;
      peakDb = 0;
    },

    setOnReading(callback: (reading: AudioReading) => void) {
      onReading = callback;
    },

    async cleanup() {
      await this.stop();
      readings = [];
      latestReading = null;
      peakDb = 0;
      onReading = null;
    },
  };
}
