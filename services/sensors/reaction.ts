/**
 * Reaction Challenge Service
 * Used for: Reaction Board Challenge (Activity 6)
 * Three phases: Tap Reaction, Swap Hands, Tracing
 */

export type ReactionPhase = 'tap' | 'swap_hands' | 'tracing';

export interface ReactionResult {
  memberId: string;
  memberName: string;
  phase: ReactionPhase;
  hand?: 'dominant' | 'non-dominant';
  reactionTimeMs: number;       // Tap/Swap: ms from target appear to tap
  accuracyPercent?: number;     // Tracing: 0–100%
  timestamp: number;
}

export interface TapTarget {
  x: number;  // 0–1 relative to screen width
  y: number;  // 0–1 relative to screen height
  appearedAt: number;
}

export function createReactionService() {
  let results: ReactionResult[] = [];
  let currentTarget: TapTarget | null = null;
  let targetTimeout: ReturnType<typeof setTimeout> | null = null;

  return {
    /** Generate a random tap target after a random delay (1–3 seconds) */
    generateTarget(onTargetAppear: (target: TapTarget) => void) {
      // Clear any existing timeout
      if (targetTimeout) {
        clearTimeout(targetTimeout);
      }

      const delay = 1000 + Math.random() * 2000; // 1–3 seconds

      targetTimeout = setTimeout(() => {
        const target: TapTarget = {
          x: 0.1 + Math.random() * 0.8,  // 10%–90% of width
          y: 0.15 + Math.random() * 0.6,  // 15%–75% of height
          appearedAt: performance.now(),
        };
        currentTarget = target;
        onTargetAppear(target);
      }, delay);
    },

    /** Record a tap on the target — returns reaction time in ms */
    recordTap(
      memberId: string,
      memberName: string,
      phase: ReactionPhase,
      hand?: 'dominant' | 'non-dominant'
    ): number | null {
      if (!currentTarget) return null;

      const reactionTimeMs = Math.round(performance.now() - currentTarget.appearedAt);
      currentTarget = null;

      const result: ReactionResult = {
        memberId,
        memberName,
        phase,
        hand,
        reactionTimeMs,
        timestamp: Date.now(),
      };
      results.push(result);

      return reactionTimeMs;
    },

    /** Record a tracing result */
    recordTracing(
      memberId: string,
      memberName: string,
      accuracyPercent: number,
      durationMs: number
    ) {
      const result: ReactionResult = {
        memberId,
        memberName,
        phase: 'tracing',
        reactionTimeMs: durationMs,
        accuracyPercent: Math.round(accuracyPercent * 10) / 10,
        timestamp: Date.now(),
      };
      results.push(result);
    },

    /** Get all results for a specific phase */
    getPhaseResults(phase: ReactionPhase): ReactionResult[] {
      return results.filter((r) => r.phase === phase);
    },

    /** Get all results for a specific member */
    getMemberResults(memberId: string): ReactionResult[] {
      return results.filter((r) => r.memberId === memberId);
    },

    /** Get average reaction time for a phase */
    getAverageReactionTime(phase: ReactionPhase): number {
      const phaseResults = results.filter((r) => r.phase === phase);
      if (phaseResults.length === 0) return 0;
      const sum = phaseResults.reduce((s, r) => s + r.reactionTimeMs, 0);
      return Math.round(sum / phaseResults.length);
    },

    /** Get best (fastest) reaction time for a phase */
    getBestReactionTime(phase: ReactionPhase): number {
      const phaseResults = results.filter((r) => r.phase === phase);
      if (phaseResults.length === 0) return 0;
      return Math.min(...phaseResults.map((r) => r.reactionTimeMs));
    },

    /** Compare dominant vs non-dominant hand */
    getHandComparison(): {
      dominant: number;
      nonDominant: number;
      difference: number;
    } {
      const dominant = results.filter(
        (r) => r.phase === 'swap_hands' && r.hand === 'dominant'
      );
      const nonDominant = results.filter(
        (r) => r.phase === 'swap_hands' && r.hand === 'non-dominant'
      );

      const avgD =
        dominant.length > 0
          ? dominant.reduce((s, r) => s + r.reactionTimeMs, 0) / dominant.length
          : 0;
      const avgND =
        nonDominant.length > 0
          ? nonDominant.reduce((s, r) => s + r.reactionTimeMs, 0) /
            nonDominant.length
          : 0;

      return {
        dominant: Math.round(avgD),
        nonDominant: Math.round(avgND),
        difference: Math.round(avgND - avgD),
      };
    },

    getAllResults(): ReactionResult[] {
      return [...results];
    },

    clearResults() {
      results = [];
      currentTarget = null;
    },

    cleanup() {
      if (targetTimeout) {
        clearTimeout(targetTimeout);
        targetTimeout = null;
      }
      results = [];
      currentTarget = null;
    },
  };
}
