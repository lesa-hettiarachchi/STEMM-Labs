/**
 * Parachute Sensor Display (Activity 1)
 * Drop timer with Start/Stop/Reset, elapsed display, computed velocity
 */

import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { createTimer, TimerState } from '@/services/sensors/timer';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';

interface Props {
  colors: Record<string, string>;
  accentColor: string;
  onTimerResult: (elapsedSeconds: number) => void;
}

export default function ParachuteSensor({ colors, accentColor, onTimerResult }: Props) {
  const timerRef = useRef(createTimer());
  const [state, setState] = useState<TimerState>({
    isRunning: false,
    elapsedMs: 0,
    laps: [],
  });

  useEffect(() => {
    const timer = timerRef.current;
    timer.setOnUpdate(setState);
    return () => timer.cleanup();
  }, []);

  const formatTime = (ms: number): string => {
    const seconds = ms / 1000;
    return seconds.toFixed(3);
  };

  const handleStartStop = () => {
    const timer = timerRef.current;
    if (state.isRunning) {
      const elapsed = timer.stop();
      onTimerResult(elapsed / 1000);
    } else {
      timer.start();
    }
  };

  const handleReset = () => {
    timerRef.current.reset();
    setState({ isRunning: false, elapsedMs: 0, laps: [] });
  };

  return (
    <View style={styles.container}>
      {/* Timer Display */}
      <View style={[styles.timerDisplay, { backgroundColor: colors.backgroundElement }]}>
        <Text style={[styles.timerLabel, { color: colors.textSecondary }]}>
          ⏱️ Drop Time
        </Text>
        <Text style={[styles.timerValue, { color: accentColor }]}>
          {formatTime(state.elapsedMs)}
        </Text>
        <Text style={[styles.timerUnit, { color: colors.textSecondary }]}>
          seconds
        </Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[
            styles.mainButton,
            {
              backgroundColor: state.isRunning ? '#EF4444' : accentColor,
            },
          ]}
          onPress={handleStartStop}
          accessibilityLabel={state.isRunning ? 'Stop timer' : 'Start timer'}
        >
          <Text style={styles.mainButtonText}>
            {state.isRunning ? '⏹ Stop' : '▶ Start'}
          </Text>
        </TouchableOpacity>

        {!state.isRunning && state.elapsedMs > 0 && (
          <TouchableOpacity
            style={[styles.resetButton, { borderColor: colors.border }]}
            onPress={handleReset}
            accessibilityLabel="Reset timer"
          >
            <Text style={[styles.resetButtonText, { color: colors.text }]}>
              🔄 Reset
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Instructions */}
      <Text style={[styles.hint, { color: colors.textSecondary }]}>
        {state.isRunning
          ? 'Drop your parachute now! Tap STOP when it lands.'
          : state.elapsedMs > 0
            ? `Drop time recorded: ${formatTime(state.elapsedMs)}s`
            : 'Tap START just before releasing the parachute.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  timerDisplay: {
    width: '100%',
    padding: Spacing.xxl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  timerLabel: {
    fontSize: Typography.bodyMedium.fontSize,
    marginBottom: Spacing.xs,
  },
  timerValue: {
    fontSize: 56,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  timerUnit: {
    fontSize: Typography.bodyMedium.fontSize,
    marginTop: Spacing.xxs,
  },
  controls: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  mainButton: {
    paddingHorizontal: Spacing.xxxl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  mainButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.titleMedium.fontSize,
    fontWeight: '700',
  },
  resetButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
  },
  resetButtonText: {
    fontSize: Typography.labelLarge.fontSize,
    fontWeight: '600',
  },
  hint: {
    fontSize: Typography.bodyMedium.fontSize,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
