/**
 * Calculation Engine — All Activity Formulas
 * Pure functions from the STEMM User Specification
 */

export interface CalculationResult {
  name: string;
  value: number;
  unit: string;
  formula: string;
}

// ─── Activity 1: Parachute ──────────────────────────────────────

export function finalVelocity(distance: number, time: number): CalculationResult {
  const v = time > 0 ? distance / time : 0;
  return {
    name: 'Final Velocity',
    value: Math.round(v * 1000) / 1000,
    unit: 'm/s',
    formula: `v = d / t = ${distance} / ${time}`,
  };
}

export function acceleration(
  vFinal: number,
  vInitial: number,
  time: number
): CalculationResult {
  const a = time > 0 ? (vFinal - vInitial) / time : 0;
  return {
    name: 'Acceleration',
    value: Math.round(a * 1000) / 1000,
    unit: 'm/s²',
    formula: `a = (v - u) / t = (${vFinal} - ${vInitial}) / ${time}`,
  };
}

export function netForce(mass: number, accel: number): CalculationResult {
  const f = mass * accel;
  return {
    name: 'Net Force',
    value: Math.round(f * 1000) / 1000,
    unit: 'N',
    formula: `F_net = m × a = ${mass} × ${accel}`,
  };
}

export function weight(mass: number): CalculationResult {
  const w = mass * 9.81;
  return {
    name: 'Weight',
    value: Math.round(w * 1000) / 1000,
    unit: 'N',
    formula: `W = m × g = ${mass} × 9.81`,
  };
}

export function dragForce(weightN: number, netForceN: number): CalculationResult {
  const drag = weightN - netForceN;
  return {
    name: 'Drag Force',
    value: Math.round(Math.abs(drag) * 1000) / 1000,
    unit: 'N',
    formula: `F_drag = W - F_net = ${weightN} - ${netForceN}`,
  };
}

export function gForceNoBounce(
  vImpact: number,
  contactTime: number
): CalculationResult {
  const g = contactTime > 0 ? vImpact / (contactTime * 9.81) : 0;
  return {
    name: 'g-Force (no bounce)',
    value: Math.round(g * 100) / 100,
    unit: 'g',
    formula: `g = v / (t_contact × 9.81) = ${vImpact} / (${contactTime} × 9.81)`,
  };
}

export function gForceBounce(
  vImpact: number,
  vUp: number,
  contactTime: number
): CalculationResult {
  const g = contactTime > 0 ? (vImpact + vUp) / (contactTime * 9.81) : 0;
  return {
    name: 'g-Force (with bounce)',
    value: Math.round(g * 100) / 100,
    unit: 'g',
    formula: `g = (v_down + v_up) / (t_contact × 9.81) = (${vImpact} + ${vUp}) / (${contactTime} × 9.81)`,
  };
}

// ─── Activity 2: Sound Pollution ─────────────────────────────────

export function averageDb(readings: number[]): CalculationResult {
  const avg =
    readings.length > 0
      ? readings.reduce((s, r) => s + r, 0) / readings.length
      : 0;
  return {
    name: 'Average Sound Level',
    value: Math.round(avg * 10) / 10,
    unit: 'dB',
    formula: `avg = Σ(readings) / n = Σ / ${readings.length}`,
  };
}

export function hearingRiskLevel(db: number): string {
  if (db < 60) return 'Safe — normal conversation level';
  if (db < 85) return 'Generally safe — prolonged exposure may cause fatigue';
  if (db < 100) return 'Hearing damage possible — limit exposure time';
  if (db < 120) return 'Dangerous — hearing protection required';
  return 'Pain threshold — immediate hearing damage risk';
}

// ─── Activity 3: Hand Fan ────────────────────────────────────────

export function handFanForce(
  springConstant: number,
  thetaDegrees: number
): CalculationResult {
  const thetaRad = (thetaDegrees * Math.PI) / 180;
  const force = springConstant * thetaRad;
  return {
    name: 'Estimated Force',
    value: Math.round(force * 10000) / 10000,
    unit: 'N',
    formula: `F = k × θ = ${springConstant} × ${thetaDegrees}° (${thetaRad.toFixed(4)} rad)`,
  };
}

// ─── Activity 5: Human Performance ──────────────────────────────

export function movementSpeed(
  distance: number,
  time: number
): CalculationResult {
  const speed = time > 0 ? distance / time : 0;
  return {
    name: 'Movement Speed',
    value: Math.round(speed * 1000) / 1000,
    unit: 'm/s',
    formula: `speed = distance / time = ${distance} / ${time}`,
  };
}

// ─── Activity 7: Breathing ──────────────────────────────────────

export function breathsPerMinute(
  peakCount: number,
  durationSeconds: number
): CalculationResult {
  const bpm = durationSeconds > 0 ? (peakCount / durationSeconds) * 60 : 0;
  return {
    name: 'Breaths per Minute',
    value: Math.round(bpm * 10) / 10,
    unit: 'BPM',
    formula: `BPM = (peaks / duration) × 60 = (${peakCount} / ${durationSeconds}) × 60`,
  };
}

// ─── Activity Router ─────────────────────────────────────────────

/**
 * Calculate results for a specific activity using recorded data
 */
export function calculateActivityResults(
  activityId: string,
  params: Record<string, number>,
  dbReadings?: number[]
): CalculationResult[] {
  switch (activityId) {
    case 'parachute': {
      const d = params.distance ?? 0;
      const t = params.time ?? 0;
      const m = params.mass ?? 0;
      const contactT = params.contactTime ?? 0.1;

      const vel = finalVelocity(d, t);
      const acc = acceleration(vel.value, 0, t);
      const nf = netForce(m, acc.value);
      const w = weight(m);
      const df = dragForce(w.value, nf.value);
      const gf = gForceNoBounce(vel.value, contactT);

      return [vel, acc, nf, w, df, gf];
    }

    case 'sound_pollution': {
      const readings = dbReadings ?? [];
      const avg = averageDb(readings);
      const peak = {
        name: 'Peak Sound Level',
        value: readings.length > 0 ? Math.max(...readings) : 0,
        unit: 'dB',
        formula: 'max(readings)',
      };
      return [avg, peak];
    }

    case 'hand_fan': {
      const k = params.springConstant ?? 0.05;
      const theta = params.angle ?? 0;
      return [handFanForce(k, theta)];
    }

    case 'earthquake': {
      const peakAmplitude = {
        name: 'Peak Vibration Amplitude',
        value: params.peakAmplitude ?? 0,
        unit: 'mm',
        formula: 'max(vibration readings)',
      };
      return [peakAmplitude];
    }

    case 'human_performance': {
      const d = params.distance ?? 0;
      const t = params.time ?? 0;
      const speed = movementSpeed(d, t);
      const smoothness = {
        name: 'Smoothness Score',
        value: params.smoothness ?? 0,
        unit: '/100',
        formula: '100 − (avg vibration × 20)',
      };
      return [speed, smoothness];
    }

    case 'reaction_board': {
      return [
        {
          name: 'Average Reaction Time',
          value: params.avgReaction ?? 0,
          unit: 'ms',
          formula: 'Σ(reaction times) / n',
        },
        {
          name: 'Best Reaction Time',
          value: params.bestReaction ?? 0,
          unit: 'ms',
          formula: 'min(reaction times)',
        },
      ];
    }

    case 'breathing': {
      const peaks = params.peaks ?? 0;
      const duration = params.duration ?? 60;
      return [breathsPerMinute(peaks, duration)];
    }

    default:
      return [];
  }
}
