export interface TimerState {
  isRunning: boolean;
  elapsedMs: number;
  laps: number[];
}

export function createTimer() {
  let startTime: number | null = null;
  let accumulatedMs = 0;
  let running = false;
  let laps: number[] = [];
  let animationFrameId: number | null = null;
  let onUpdate: ((state: TimerState) => void) | null = null;

  function getElapsed(): number {
    if (running && startTime !== null) {
      return accumulatedMs + (performance.now() - startTime);
    }
    return accumulatedMs;
  }

  function tick() {
    if (!running) return;
    if (onUpdate) {
      onUpdate({
        isRunning: running,
        elapsedMs: getElapsed(),
        laps,
      });
    }
    animationFrameId = requestAnimationFrame(tick);
  }

  return {
    start() {
      if (running) return;
      running = true;
      startTime = performance.now();
      tick();
    },

    stop(): number {
      if (!running) return getElapsed();
      running = false;
      accumulatedMs += performance.now() - (startTime ?? performance.now());
      startTime = null;
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      return accumulatedMs;
    },

    lap(): number {
      const elapsed = getElapsed();
      laps.push(elapsed);
      return elapsed;
    },

    reset() {
      running = false;
      startTime = null;
      accumulatedMs = 0;
      laps = [];
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    },

    getElapsedSeconds(): number {
      return Math.round(getElapsed()) / 1000;
    },

    getState(): TimerState {
      return {
        isRunning: running,
        elapsedMs: getElapsed(),
        laps: [...laps],
      };
    },

    setOnUpdate(callback: (state: TimerState) => void) {
      onUpdate = callback;
    },

    cleanup() {
      running = false;
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      onUpdate = null;
    },
  };
}
