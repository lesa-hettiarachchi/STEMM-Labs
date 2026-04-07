/**
 * Accelerometer-based Sensor Display
 * Shared component for: Hand Fan (angle), Earthquake (vibration),
 * Human Performance (smoothness), Breathing (amplitude)
 */

import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated } from 'react-native';
import {
  createAccelerometerService,
  AccelerometerReading,
} from '@/services/sensors/accelerometer';
import { Spacing, BorderRadius, Typography } from '@/constants/theme';

type AccelMode = 'angle' | 'vibration' | 'smoothness' | 'breathing';

interface Props {
  mode: AccelMode;
  colors: Record<string, string>;
  accentColor: string;
  onReadingUpdate: (reading: AccelerometerReading) => void;
}

const MODE_CONFIG: Record<AccelMode, { icon: string; label: string; unit: string }> = {
  angle: { icon: '📐', label: 'Bend Angle', unit: '°' },
  vibration: { icon: '🌊', label: 'Vibration Amplitude', unit: 'mm' },
  smoothness: { icon: '🏃', label: 'Smoothness Score', unit: '/100' },
  breathing: { icon: '🫁', label: 'Breathing Movement', unit: 'g' },
};

export default function AccelSensor({ mode, colors, accentColor, onReadingUpdate }: Props) {
  const accelRef = useRef(createAccelerometerService());
  const [isActive, setIsActive] = useState(false);
  const [displayValue, setDisplayValue] = useState(0);
  const [peakValue, setPeakValue] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const gaugeAnim = useRef(new Animated.Value(0)).current;

  const config = MODE_CONFIG[mode];

  useEffect(() => {
    return () => { accelRef.current.cleanup(); };
  }, []);

  // Duration timer
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      if (startTimeRef.current) {
        setDurationSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  const getValue = (reading: AccelerometerReading): number => {
    switch (mode) {
      case 'angle': return reading.bendAngleDeg;
      case 'vibration': return reading.vibrationAmplitudeMm;
      case 'smoothness': return accelRef.current.getSmoothnessScore();
      case 'breathing': return Math.round(Math.abs(reading.z) * 1000) / 1000;
    }
  };

  const handleToggle = async () => {
    const accel = accelRef.current;
    if (isActive) {
      accel.stop();
      setIsActive(false);
    } else {
      accel.setOnReading((reading) => {
        const val = getValue(reading);
        setDisplayValue(val);
        onReadingUpdate(reading);

        if (mode !== 'smoothness' && val > peakValue) setPeakValue(val);

        // Animate gauge (normalize to 0–1)
        const maxScale = mode === 'angle' ? 90 : mode === 'vibration' ? 50 : mode === 'smoothness' ? 100 : 2;
        const pct = Math.min(val / maxScale, 1);
        Animated.spring(gaugeAnim, {
          toValue: pct,
          tension: 80,
          friction: 12,
          useNativeDriver: false,
        }).start();
      });
      accel.clearReadings();
      setPeakValue(0);
      startTimeRef.current = Date.now();
      setDurationSeconds(0);
      await accel.start(mode === 'breathing' ? 50 : 100);
      setIsActive(true);
    }
  };

  const getExtraInfo = () => {
    if (mode === 'breathing' && isActive && durationSeconds > 5) {
      const bpm = accelRef.current.getBreathsPerMinute(durationSeconds);
      return `~${bpm} breaths/min`;
    }
    if (mode === 'vibration') {
      return `Peak: ${peakValue.toFixed(1)} mm`;
    }
    return null;
  };

  return (
    <View style={styles.container}>
      {/* Value Display */}
      <View style={[styles.valueDisplay, { backgroundColor: colors.backgroundElement }]}>
        <Text style={[styles.displayLabel, { color: colors.textSecondary }]}>
          {config.icon} {config.label}
        </Text>
        <Text style={[styles.displayValue, { color: accentColor }]}>
          {mode === 'smoothness' ? displayValue : displayValue.toFixed(1)}
        </Text>
        <Text style={[styles.displayUnit, { color: colors.textSecondary }]}>
          {config.unit}
        </Text>
      </View>

      {/* Gauge Bar */}
      <View style={[styles.gaugeContainer, { backgroundColor: colors.backgroundElement }]}>
        <Animated.View
          style={[
            styles.gauge,
            {
              backgroundColor: accentColor,
              width: gaugeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>

      {/* Extra Info */}
      {getExtraInfo() && (
        <Text style={[styles.extraInfo, { color: accentColor }]}>
          {getExtraInfo()}
        </Text>
      )}

      {/* Duration */}
      {isActive && (
        <Text style={[styles.duration, { color: colors.textSecondary }]}>
          Recording: {durationSeconds}s
        </Text>
      )}

      {/* Toggle */}
      <TouchableOpacity
        style={[styles.toggleButton, { backgroundColor: isActive ? '#EF4444' : accentColor }]}
        onPress={handleToggle}
        accessibilityLabel={isActive ? 'Stop sensor' : 'Start sensor'}
      >
        <Text style={styles.toggleText}>
          {isActive ? '⏹ Stop' : '▶ Start Sensor'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  valueDisplay: {
    width: '100%',
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  displayLabel: { fontSize: Typography.bodyMedium.fontSize, marginBottom: Spacing.xs },
  displayValue: { fontSize: 56, fontWeight: '700', fontVariant: ['tabular-nums'] },
  displayUnit: { fontSize: Typography.bodyMedium.fontSize, marginTop: Spacing.xxs },
  gaugeContainer: {
    width: '100%',
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  gauge: { height: '100%', borderRadius: 10 },
  extraInfo: {
    fontSize: Typography.labelLarge.fontSize,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  duration: {
    fontSize: Typography.bodyMedium.fontSize,
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
});
