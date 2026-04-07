/**
 * Reaction Sensor Display (Activity 6)
 * Tap target challenge with member rotation
 */

import React, { useCallback, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Pressable,
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
            // Phase complete — move to next phase or finish
            if (phase === 'tap') {
              setPhase('swap_hands');
              setHand('dominant');
              setCurrentMemberIndex(0);
              setTrialNumber(0);
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

  if (isComplete) {
    const avgTap = reactionRef.current.getAverageReactionTime('tap');
    const handComp = reactionRef.current.getHandComparison();

    return (
      <View style={styles.container}>
        <Text style={[styles.completeIcon]}>🎉</Text>
        <Text style={[styles.completeTitle, { color: colors.text }]}>
          Challenge Complete!
        </Text>
        <View style={[styles.resultCard, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
            Avg Tap Reaction
          </Text>
          <Text style={[styles.resultValue, { color: accentColor }]}>
            {avgTap} ms
          </Text>
        </View>
        <View style={[styles.resultCard, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
            Dominant vs Non-Dominant
          </Text>
          <Text style={[styles.resultValue, { color: accentColor }]}>
            {handComp.dominant} ms vs {handComp.nonDominant} ms
          </Text>
          <Text style={[styles.resultDiff, { color: colors.textSecondary }]}>
            Difference: {handComp.difference} ms
          </Text>
        </View>
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
        {phase === 'tap' ? '👆 Tap Reaction' : '🤲 Swap Hands'}
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
  completeIcon: { fontSize: 48, marginBottom: Spacing.md },
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
