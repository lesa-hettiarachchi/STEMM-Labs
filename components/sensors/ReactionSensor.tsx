import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Pressable,
  PanResponder,
} from 'react-native';
import type { TeamMember } from '@/constants/types';
import {
  createReactionService,
  ReactionPhase,
  TapTarget,
  ReactionResult,
} from '@/services/sensors/reaction';
import { Spacing, BorderRadius, Typography } from '@/constants/theme';

interface Props {
  colors: Record<string, string>;
  accentColor: string;
  members: TeamMember[];
  onComplete: (results: ReactionResult[]) => void;
}

const TRIALS_PER_MEMBER = 5;
const SCREEN_WIDTH = Dimensions.get('window').width;
const PLAY_AREA_HEIGHT = 350;

export default function ReactionSensor({ colors, accentColor, members, onComplete }: Props) {
  const reactionRef = useRef(createReactionService());
  const [phase, setPhase] = useState<ReactionPhase>('tap');
  const [currentMemberIndex, setCurrentMemberIndex] = useState(0);
  const [trialNumber, setTrialNumber] = useState(0);
  const [target, setTarget] = useState<TapTarget | null>(null);
  const [lastReactionTime, setLastReactionTime] = useState<number | null>(null);
  const [isWaiting, setIsWaiting] = useState(false);
  const [hand, setHand] = useState<'dominant' | 'non-dominant'>('dominant');
  const [isComplete, setIsComplete] = useState(false);

  const currentMember = members[currentMemberIndex];

  const startTrial = useCallback(() => {
    setTarget(null);
    setLastReactionTime(null);
    setIsWaiting(true);

    reactionRef.current.generateTarget((t) => {
      setTarget(t);
      setIsWaiting(false);
    });
  }, []);

  const handleTap = useCallback(() => {
    if (!target || !currentMember) return;

    const reactionTime = reactionRef.current.recordTap(
      currentMember.id,
      currentMember.firstName,
      phase,
      phase === 'swap_hands' ? hand : undefined
    );

    if (reactionTime !== null) {
      setLastReactionTime(reactionTime);
      setTarget(null);

      const nextTrial = trialNumber + 1;

      if (nextTrial >= TRIALS_PER_MEMBER) {
        // Move to next hand or member
        if (phase === 'swap_hands' && hand === 'dominant') {
          setHand('non-dominant');
          setTrialNumber(0);
        } else {
          const nextMember = currentMemberIndex + 1;
          if (nextMember >= members.length) {
            // Phase complete — advance to next phase
            if (phase === 'tap') {
              setPhase('swap_hands');
              setHand('dominant');
              setCurrentMemberIndex(0);
              setTrialNumber(0);
            } else if (phase === 'swap_hands') {
              // Move to Phase 3: Tracing
              setPhase('tracing');
              setCurrentMemberIndex(0);
            } else {
              setIsComplete(true);
              onComplete(reactionRef.current.getAllResults());
            }
          } else {
            setCurrentMemberIndex(nextMember);
            setTrialNumber(0);
            if (phase === 'swap_hands') setHand('dominant');
          }
        }
      } else {
        setTrialNumber(nextTrial);
      }
    }
  }, [target, currentMember, phase, hand, trialNumber, currentMemberIndex, members, onComplete]);

  // ─── Phase 3: Tracing Challenge ───────────────────────────────────
  if (phase === 'tracing' && !isComplete) {
    const handleTracingComplete = (accuracy: number, durationMs: number) => {
      reactionRef.current.recordTracing(
        currentMember?.id ?? 'unknown',
        currentMember?.firstName ?? 'Player',
        accuracy,
        durationMs
      );
      const nextMember = currentMemberIndex + 1;
      if (nextMember >= members.length) {
        setIsComplete(true);
        onComplete(reactionRef.current.getAllResults());
      } else {
        setCurrentMemberIndex(nextMember);
      }
    };

    return (
      <View style={styles.container}>
        <View style={[styles.memberBanner, { backgroundColor: accentColor + '15' }]}>
          <Text style={[styles.memberName, { color: accentColor }]}>
            👤 {currentMember?.firstName ?? 'Player'}
          </Text>
          <Text style={[styles.trialInfo, { color: colors.textSecondary }]}>
            Phase 3 · Tracing
          </Text>
        </View>
        <Text style={[styles.phaseLabel, { color: colors.text }]}>
          Phase 3 · Follow the Dot
        </Text>
        <TracingChallenge
          colors={colors}
          accentColor={accentColor}
          onComplete={handleTracingComplete}
        />
      </View>
    );
  }

  if (isComplete) {
    const avgTap = reactionRef.current.getAverageReactionTime('tap');
    const handComp = reactionRef.current.getHandComparison();
    const tracingResults = reactionRef.current.getPhaseResults('tracing');
    const avgAccuracy =
      tracingResults.length > 0
        ? Math.round(
            tracingResults.reduce((s, r) => s + (r.accuracyPercent ?? 0), 0) /
              tracingResults.length
          )
        : null;

    return (
      <View style={styles.container}>
        <Ionicons name="trophy-outline" size={48} color={accentColor} style={{ marginBottom: Spacing.md }} />
        <Text style={[styles.completeTitle, { color: colors.text }]}>
          All 3 Phases Complete
        </Text>
        <View style={[styles.resultCard, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
            Phase 1 · Avg Tap Reaction
          </Text>
          <Text style={[styles.resultValue, { color: accentColor }]}>
            {avgTap} ms
          </Text>
        </View>
        <View style={[styles.resultCard, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
            Phase 2 · Dominant vs Non-Dominant
          </Text>
          <Text style={[styles.resultValue, { color: accentColor }]}>
            {handComp.dominant} ms vs {handComp.nonDominant} ms
          </Text>
          <Text style={[styles.resultDiff, { color: colors.textSecondary }]}>
            Difference: {handComp.difference} ms
          </Text>
        </View>
        {avgAccuracy !== null && (
          <View style={[styles.resultCard, { backgroundColor: colors.backgroundElement }]}>
            <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
              Phase 3 · Tracing Accuracy
            </Text>
            <Text style={[styles.resultValue, { color: accentColor }]}>
              {avgAccuracy}%
            </Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Member Banner */}
      <View style={[styles.memberBanner, { backgroundColor: accentColor + '15' }]}>
        <Text style={[styles.memberName, { color: accentColor }]}>
          👤 {currentMember?.firstName ?? 'Player'}
        </Text>
        <Text style={[styles.trialInfo, { color: colors.textSecondary }]}>
          {phase === 'swap_hands' ? `${hand} hand · ` : ''}
          Trial {trialNumber + 1}/{TRIALS_PER_MEMBER}
        </Text>
      </View>

      {/* Phase Label */}
      <Text style={[styles.phaseLabel, { color: colors.text }]}>
        {phase === 'tap' ? 'Phase 1 · Tap Reaction' : 'Phase 2 · Swap Hands'}
      </Text>

      {/* Play Area */}
      <View style={[styles.playArea, { backgroundColor: colors.backgroundElement }]}>
        {isWaiting ? (
          <Text style={[styles.waitText, { color: colors.textSecondary }]}>
            Wait for the target...
          </Text>
        ) : target ? (
          <Pressable
            onPress={handleTap}
            style={[
              styles.target,
              {
                backgroundColor: accentColor,
                left: target.x * (SCREEN_WIDTH - 100),
                top: target.y * PLAY_AREA_HEIGHT,
              },
            ]}
            accessibilityLabel="Tap the target"
          >
            <Text style={styles.targetText}>TAP!</Text>
          </Pressable>
        ) : lastReactionTime !== null ? (
          <View style={styles.resultFeedback}>
            <Text style={[styles.reactionTime, { color: accentColor }]}>
              {lastReactionTime} ms
            </Text>
            <TouchableOpacity
              style={[styles.nextButton, { backgroundColor: accentColor }]}
              onPress={startTrial}
            >
              <Text style={styles.nextButtonText}>Next →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: accentColor }]}
            onPress={startTrial}
          >
            <Text style={styles.startButtonText}>Start Trial</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  memberBanner: {
    width: '100%',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  memberName: { fontSize: Typography.labelLarge.fontSize, fontWeight: '600' },
  trialInfo: { fontSize: Typography.bodyMedium.fontSize },
  phaseLabel: {
    fontSize: Typography.titleMedium.fontSize,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  playArea: {
    width: '100%',
    height: PLAY_AREA_HEIGHT,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  waitText: { fontSize: Typography.titleMedium.fontSize, fontStyle: 'italic' },
  target: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  resultFeedback: { alignItems: 'center' },
  reactionTime: { fontSize: 48, fontWeight: '700', marginBottom: Spacing.lg },
  nextButton: {
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  nextButtonText: { color: '#FFF', fontSize: Typography.labelLarge.fontSize, fontWeight: '600' },
  startButton: {
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  startButtonText: { color: '#FFF', fontSize: Typography.titleMedium.fontSize, fontWeight: '700' },
  completeTitle: { fontSize: Typography.headlineMedium.fontSize, fontWeight: '700', marginBottom: Spacing.lg },
  resultCard: {
    width: '100%',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  resultLabel: { fontSize: Typography.bodyMedium.fontSize, marginBottom: Spacing.xxs },
  resultValue: { fontSize: Typography.titleLarge.fontSize, fontWeight: '700' },
  resultDiff: { fontSize: Typography.bodyMedium.fontSize, marginTop: Spacing.xxs },
});

// ─── Phase 3: Tracing Challenge Component ─────────────────────────

const TRACING_DURATION_S = 10;
const TRACING_DOT_RADIUS = 30;
const TRACING_HITBOX = 52;       // Slightly larger than visible dot for fairness
const TRACING_AREA_WIDTH = SCREEN_WIDTH - 64;
const TRACING_AREA_HEIGHT = 220;
const DOT_MOVE_INTERVAL_MS = 700; // How often the dot jumps to a new position
const SCORE_SAMPLE_MS = 200;      // How often we check finger-vs-dot distance

function TracingChallenge({
  colors,
  accentColor,
  onComplete,
}: {
  colors: Record<string, string>;
  accentColor: string;
  onComplete: (accuracy: number, durationMs: number) => void;
}) {
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TRACING_DURATION_S);
  const [dotPos, setDotPos] = useState({ x: TRACING_AREA_WIDTH / 2, y: TRACING_AREA_HEIGHT / 2 });
  const [isOnTarget, setIsOnTarget] = useState(false);
  const [finalAccuracy, setFinalAccuracy] = useState<number | null>(null);

  // Refs so interval callbacks always read the latest values without stale closures
  const dotPosRef = useRef({ x: TRACING_AREA_WIDTH / 2, y: TRACING_AREA_HEIGHT / 2 });
  const fingerPosRef = useRef({ x: -999, y: -999 });
  const hitsRef = useRef(0);
  const samplesRef = useRef(0);
  const startTimeRef = useRef(0);
  const moveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scoreTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const doneRef = useRef(false);

  const clearTimers = () => {
    if (moveTimerRef.current) clearInterval(moveTimerRef.current);
    if (scoreTimerRef.current) clearInterval(scoreTimerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  };

  const randomPos = () => {
    const m = TRACING_DOT_RADIUS + 10;
    return {
      x: m + Math.random() * (TRACING_AREA_WIDTH - m * 2),
      y: m + Math.random() * (TRACING_AREA_HEIGHT - m * 2),
    };
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        fingerPosRef.current = { x: e.nativeEvent.locationX, y: e.nativeEvent.locationY };
      },
      onPanResponderMove: (e) => {
        fingerPosRef.current = { x: e.nativeEvent.locationX, y: e.nativeEvent.locationY };
      },
      onPanResponderRelease: () => {
        fingerPosRef.current = { x: -999, y: -999 };
      },
      onPanResponderTerminate: () => {
        fingerPosRef.current = { x: -999, y: -999 };
      },
    })
  ).current;

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    clearTimers();
    const acc =
      samplesRef.current > 0
        ? (hitsRef.current / samplesRef.current) * 100
        : 0;
    const rounded = Math.round(acc * 10) / 10;
    setFinalAccuracy(rounded);
    const duration = Date.now() - startTimeRef.current;
    setTimeout(() => onComplete(rounded, duration), 1200);
  }, [onComplete]);

  const start = useCallback(() => {
    doneRef.current = false;
    hitsRef.current = 0;
    samplesRef.current = 0;
    startTimeRef.current = Date.now();
    setStarted(true);
    setTimeLeft(TRACING_DURATION_S);

    // Move dot to random positions
    moveTimerRef.current = setInterval(() => {
      const pos = randomPos();
      dotPosRef.current = pos;
      setDotPos(pos);
    }, DOT_MOVE_INTERVAL_MS);

    // Sample finger–dot distance
    scoreTimerRef.current = setInterval(() => {
      const fp = fingerPosRef.current;
      const dp = dotPosRef.current;
      const dx = fp.x - dp.x;
      const dy = fp.y - dp.y;
      const onTarget = Math.sqrt(dx * dx + dy * dy) <= TRACING_HITBOX;
      samplesRef.current++;
      if (onTarget) hitsRef.current++;
      setIsOnTarget(onTarget);
    }, SCORE_SAMPLE_MS);

    // Countdown
    let remaining = TRACING_DURATION_S;
    countdownRef.current = setInterval(() => {
      remaining -= 1;
      setTimeLeft(remaining);
      if (remaining <= 0) finish();
    }, 1000);
  }, [finish]);

  useEffect(() => () => clearTimers(), []);

  // ── Render ──────────────────────────────────────────────────────

  if (finalAccuracy !== null) {
    return (
      <View style={tracingStyles.container}>
        <Ionicons
          name={finalAccuracy >= 70 ? 'trophy-outline' : finalAccuracy >= 40 ? 'thumbs-up-outline' : 'fitness-outline'}
          size={48}
          color={accentColor}
          style={{ marginBottom: Spacing.sm }}
        />
        <Text style={[tracingStyles.scoreValue, { color: accentColor }]}>
          {finalAccuracy}%
        </Text>
        <Text style={[tracingStyles.scoreLabel, { color: colors.textSecondary }]}>
          Tracing Accuracy
        </Text>
      </View>
    );
  }

  if (!started) {
    return (
      <View style={tracingStyles.container}>
        <Text style={[tracingStyles.instruction, { color: colors.text }]}>
          Keep your finger on the moving dot for {TRACING_DURATION_S} seconds.
          Follow it as it jumps around the screen!
        </Text>
        <TouchableOpacity
          style={[tracingStyles.startBtn, { backgroundColor: accentColor }]}
          onPress={start}
        >
          <Text style={tracingStyles.startBtnText}>Start Tracing</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={tracingStyles.container}>
      {/* Timer + live accuracy */}
      <View style={tracingStyles.statsRow}>
        <View style={tracingStyles.statCell}>
          <Ionicons name="time-outline" size={16} color={colors.text} />
          <Text style={[tracingStyles.stat, { color: colors.text }]}>{timeLeft}s</Text>
        </View>
        <View style={tracingStyles.statCell}>
          <Ionicons
            name={isOnTarget ? 'checkmark-circle' : 'close-circle'}
            size={16}
            color={isOnTarget ? '#10B981' : '#EF4444'}
          />
          <Text style={[tracingStyles.stat, { color: isOnTarget ? '#10B981' : '#EF4444' }]}>
            {isOnTarget ? 'On Target' : 'Off Target'}
          </Text>
        </View>
        <Text style={[tracingStyles.stat, { color: colors.textSecondary }]}>
          {samplesRef.current > 0
            ? `${Math.round((hitsRef.current / samplesRef.current) * 100)}%`
            : '—'}
        </Text>
      </View>

      {/* Play area */}
      <View
        style={[tracingStyles.playArea, { backgroundColor: colors.backgroundElement }]}
        {...panResponder.panHandlers}
      >
        {/* Moving dot */}
        <View
          style={[
            tracingStyles.dot,
            {
              left: dotPos.x - TRACING_DOT_RADIUS,
              top: dotPos.y - TRACING_DOT_RADIUS,
              backgroundColor: isOnTarget ? '#10B981' : accentColor,
            },
          ]}
        />
      </View>
      <Text style={[tracingStyles.hint, { color: colors.textSecondary }]}>
        Hold your finger on the dot
      </Text>
    </View>
  );
}

const tracingStyles = StyleSheet.create({
  container: { width: '100%', alignItems: 'center' },
  instruction: {
    fontSize: Typography.bodyLarge.fontSize,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.sm,
  },
  startBtn: {
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: Typography.titleMedium.fontSize,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: Spacing.md,
  },
  statCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xxs,
  },
  stat: {
    fontSize: Typography.labelLarge.fontSize,
    fontWeight: '600',
  },
  playArea: {
    width: TRACING_AREA_WIDTH,
    height: TRACING_AREA_HEIGHT,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  dot: {
    position: 'absolute',
    width: TRACING_DOT_RADIUS * 2,
    height: TRACING_DOT_RADIUS * 2,
    borderRadius: TRACING_DOT_RADIUS,
  },
  hint: {
    fontSize: Typography.bodyMedium.fontSize,
    marginTop: Spacing.md,
  },
  scoreValue: {
    fontSize: 56,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  scoreLabel: {
    fontSize: Typography.bodyLarge.fontSize,
    marginTop: Spacing.xs,
  },
});
