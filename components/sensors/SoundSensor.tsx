/**
 * Sound Sensor Display (Activity 2)
 * Live dB meter bar with peak indicator, risk level, and save-per-action snapshot
 * Uses expo-audio (replaces deprecated expo-av)
 */

import React, { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, View, Text, Animated, TouchableOpacity } from 'react-native';
import {
  useAudioRecorder,
  useAudioRecorderState,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
} from 'expo-audio';
import {
  convertToEnvironmentalDb,
  getHearingRisk,
  type AudioReading,
} from '@/services/sensors/audio';
import { Spacing, BorderRadius, Typography } from '@/constants/theme';

interface SavedReading {
  label: string;
  db: number;
  risk: string;
  riskColor: string;
}

interface Props {
  colors: Record<string, string>;
  accentColor: string;
  onReadingUpdate: (reading: AudioReading) => void;
  onSaveReading?: (reading: SavedReading) => void;
}

export default function SoundSensor({ colors, accentColor, onReadingUpdate, onSaveReading }: Props) {
  const audioRecorder = useAudioRecorder({
    ...RecordingPresets.HIGH_QUALITY,
    isMeteringEnabled: true,
  });
  const recorderState = useAudioRecorderState(audioRecorder, 200);

  const [isActive, setIsActive] = useState(false);
  const [currentDb, setCurrentDb] = useState(0);
  const [peakDb, setPeakDb] = useState(0);
  const [riskLevel, setRiskLevel] = useState(getHearingRisk(0));
  const [savedReadings, setSavedReadings] = useState<SavedReading[]>([]);
  const barWidth = useRef(new Animated.Value(0)).current;

  // Request mic permission on mount
  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert('Permission Denied', 'Microphone permission is required for sound measurement.');
      }
    })();
  }, []);

  // Process metering data from recorder state
  useEffect(() => {
    if (!isActive || recorderState.metering === undefined) return;

    const dbFS = recorderState.metering;
    const approxDb = convertToEnvironmentalDb(dbFS);
    const roundedDb = Math.round(approxDb);

    setCurrentDb(roundedDb);
    if (roundedDb > peakDb) setPeakDb(roundedDb);
    setRiskLevel(getHearingRisk(roundedDb));

    const reading: AudioReading = { dbFS, approxDb, timestamp: Date.now() };
    onReadingUpdate(reading);

    // Animate bar width (0–130 dB scale → 0–100%)
    const pct = Math.min(approxDb / 130, 1);
    Animated.spring(barWidth, {
      toValue: pct,
      tension: 80,
      friction: 12,
      useNativeDriver: false,
    }).start();
  }, [recorderState.metering, isActive]);

  const handleToggle = async () => {
    if (isActive) {
      await audioRecorder.stop();
      setIsActive(false);
    } else {
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setIsActive(true);
    }
  };

  const handleSaveReading = () => {
    const readingNumber = savedReadings.length + 1;
    const saved: SavedReading = {
      label: `Reading ${readingNumber}`,
      db: currentDb,
      risk: riskLevel.level,
      riskColor: riskLevel.color,
    };
    setSavedReadings(prev => [...prev, saved]);
    if (onSaveReading) onSaveReading(saved);
  };

  const barColor =
    currentDb < 30 ? '#10B981' :
    currentDb < 60 ? '#10B981' :
    currentDb < 85 ? '#F59E0B' :
    currentDb < 100 ? '#EF4444' : '#DC2626';

  return (
    <View style={styles.container}>
      {/* dB Display */}
      <View style={[styles.dbDisplay, { backgroundColor: colors.backgroundElement }]}>
        <Text style={[styles.dbLabel, { color: colors.textSecondary }]}>
          🔊 Sound Level
        </Text>
        <Text style={[styles.dbValue, { color: barColor }]}>
          {currentDb}
        </Text>
        <Text style={[styles.dbUnit, { color: colors.textSecondary }]}>
          dB (approx)
        </Text>
      </View>

      {/* Level Bar */}
      <View style={[styles.barContainer, { backgroundColor: colors.backgroundElement }]}>
        <Animated.View
          style={[
            styles.bar,
            {
              backgroundColor: barColor,
              width: barWidth.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
      {/* Scale markers */}
      <View style={styles.scaleMarkers}>
        <Text style={[styles.scaleText, { color: colors.textSecondary }]}>0</Text>
        <Text style={[styles.scaleText, { color: colors.textSecondary }]}>30</Text>
        <Text style={[styles.scaleText, { color: colors.textSecondary }]}>60</Text>
        <Text style={[styles.scaleText, { color: colors.textSecondary }]}>85</Text>
        <Text style={[styles.scaleText, { color: colors.textSecondary }]}>100</Text>
        <Text style={[styles.scaleText, { color: colors.textSecondary }]}>130</Text>
      </View>

      {/* Peak + Risk */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Peak</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>{peakDb} dB</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: riskLevel.color + '15' }]}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Risk</Text>
          <Text style={[styles.statValue, { color: riskLevel.color }]}>{riskLevel.level}</Text>
        </View>
      </View>

      {/* Risk description */}
      {riskLevel.description ? (
        <Text style={[styles.riskDescription, { color: riskLevel.color }]}>
          {riskLevel.description}
        </Text>
      ) : null}

      {/* Action Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.toggleButton, { backgroundColor: isActive ? '#EF4444' : accentColor }]}
          onPress={handleToggle}
          accessibilityLabel={isActive ? 'Stop recording sound' : 'Start recording sound'}
        >
          <Text style={styles.toggleText}>
            {isActive ? '⏹ Stop' : '🎙️ Start'}
          </Text>
        </TouchableOpacity>

        {isActive && (
          <TouchableOpacity
            style={[styles.saveButton, { borderColor: accentColor }]}
            onPress={handleSaveReading}
            accessibilityLabel="Save current reading"
          >
            <Text style={[styles.saveText, { color: accentColor }]}>
              📸 Save Reading
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Saved Readings List */}
      {savedReadings.length > 0 && (
        <View style={[styles.savedSection, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.savedTitle, { color: colors.text }]}>
            📋 Saved Readings
          </Text>
          {savedReadings.map((reading, i) => (
            <View key={i} style={[styles.savedRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.savedLabel, { color: colors.text }]}>
                {reading.label}
              </Text>
              <Text style={[styles.savedDb, { color: colors.text }]}>
                {reading.db} dB
              </Text>
              <Text style={[styles.savedRisk, { color: reading.riskColor }]}>
                {reading.risk}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  dbDisplay: {
    width: '100%',
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  dbLabel: { fontSize: Typography.bodyMedium.fontSize, marginBottom: Spacing.xs },
  dbValue: { fontSize: 56, fontWeight: '700', fontVariant: ['tabular-nums'] },
  dbUnit: { fontSize: Typography.bodyMedium.fontSize, marginTop: Spacing.xxs },
  barContainer: {
    width: '100%',
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  bar: {
    height: '100%',
    borderRadius: 12,
  },
  scaleMarkers: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginBottom: Spacing.md,
  },
  scaleText: { fontSize: 10 },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    width: '100%',
    marginBottom: Spacing.sm,
  },
  statBox: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  statLabel: { fontSize: Typography.labelSmall.fontSize, marginBottom: 2 },
  statValue: { fontSize: Typography.titleMedium.fontSize, fontWeight: '600' },
  riskDescription: {
    fontSize: Typography.bodyMedium.fontSize,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  toggleButton: {
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  toggleText: {
    color: '#FFFFFF',
    fontSize: Typography.labelLarge.fontSize,
    fontWeight: '700',
  },
  saveButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
  },
  saveText: {
    fontSize: Typography.labelLarge.fontSize,
    fontWeight: '600',
  },
  savedSection: {
    width: '100%',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  savedTitle: {
    fontSize: Typography.labelLarge.fontSize,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  savedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  savedLabel: { fontSize: Typography.bodyMedium.fontSize, flex: 1 },
  savedDb: { fontSize: Typography.bodyMedium.fontSize, fontWeight: '600', marginRight: Spacing.md },
  savedRisk: { fontSize: Typography.bodyMedium.fontSize, fontWeight: '500', minWidth: 80, textAlign: 'right' },
});
