/**
 * Sound Sensor Display (Activity 2)
 * Live dB meter bar with peak indicator and risk level
 */

import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, Animated, TouchableOpacity } from 'react-native';
import { createAudioService, AudioReading } from '@/services/sensors/audio';
import { Spacing, BorderRadius, Typography } from '@/constants/theme';

interface Props {
  colors: Record<string, string>;
  accentColor: string;
  onReadingUpdate: (reading: AudioReading) => void;
}

export default function SoundSensor({ colors, accentColor, onReadingUpdate }: Props) {
  const audioRef = useRef(createAudioService());
  const [isActive, setIsActive] = useState(false);
  const [currentDb, setCurrentDb] = useState(0);
  const [peakDb, setPeakDb] = useState(0);
  const [riskLevel, setRiskLevel] = useState({ level: 'Safe', color: '#10B981' });
  const barWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    return () => { audioRef.current.cleanup(); };
  }, []);

  const handleToggle = async () => {
    const audio = audioRef.current;
    if (isActive) {
      await audio.stop();
      setIsActive(false);
    } else {
      audio.setOnReading((reading) => {
        setCurrentDb(Math.round(reading.approxDb));
        const peak = audio.getPeakDb();
        setPeakDb(peak);
        setRiskLevel(audio.getHearingRisk(reading.approxDb));
        onReadingUpdate(reading);

        // Animate bar width (0–130 dB scale → 0–100%)
        const pct = Math.min(reading.approxDb / 130, 1);
        Animated.spring(barWidth, {
          toValue: pct,
          tension: 80,
          friction: 12,
          useNativeDriver: false,
        }).start();
      });
      await audio.start(200);
      setIsActive(true);
    }
  };

  const barColor =
    currentDb < 60 ? '#10B981' : currentDb < 85 ? '#F59E0B' : '#EF4444';

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
        {/* Scale markers */}
        <View style={styles.scaleMarkers}>
          <Text style={[styles.scaleText, { color: colors.textSecondary }]}>0</Text>
          <Text style={[styles.scaleText, { color: colors.textSecondary }]}>60</Text>
          <Text style={[styles.scaleText, { color: colors.textSecondary }]}>85</Text>
          <Text style={[styles.scaleText, { color: colors.textSecondary }]}>130</Text>
        </View>
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

      {/* Toggle Button */}
      <TouchableOpacity
        style={[styles.toggleButton, { backgroundColor: isActive ? '#EF4444' : accentColor }]}
        onPress={handleToggle}
        accessibilityLabel={isActive ? 'Stop recording sound' : 'Start recording sound'}
      >
        <Text style={styles.toggleText}>
          {isActive ? '⏹ Stop Recording' : '🎙️ Start Recording'}
        </Text>
      </TouchableOpacity>
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
    position: 'absolute',
    top: 24,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  scaleText: { fontSize: 10 },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    width: '100%',
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  statBox: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  statLabel: { fontSize: Typography.labelSmall.fontSize, marginBottom: 2 },
  statValue: { fontSize: Typography.titleMedium.fontSize, fontWeight: '600' },
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
});
