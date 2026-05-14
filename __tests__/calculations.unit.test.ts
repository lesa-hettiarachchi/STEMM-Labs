/**
 * UNIT TESTS — calculations.ts
 * Person 1 (Lesa)
 *
 * Tests every pure calculation function in isolation to verify that
 * STEMM physics formulas produce correct numeric outputs.
 */

import {
    acceleration,
    averageDb,
    breathsPerMinute,
    dragForce,
    finalVelocity,
    gForceBounce,
    gForceNoBounce,
    handFanForce,
    hearingRiskLevel,
    movementSpeed,
    netForce,
    weight,
} from '../services/calculations';

// ─── finalVelocity ────────────────────────────────────────────────

describe('finalVelocity', () => {
    it('calculates velocity as distance / time', () => {
        const result = finalVelocity(1.0, 0.5);
        expect(result.value).toBe(2.0);
        expect(result.unit).toBe('m/s');
        expect(result.name).toBe('Final Velocity');
    });

    it('returns 0 when time is zero (prevents divide-by-zero)', () => {
        const result = finalVelocity(5, 0);
        expect(result.value).toBe(0);
    });

    it('rounds to 3 decimal places', () => {
        const result = finalVelocity(1, 3); // 0.3333...
        expect(result.value).toBe(0.333);
    });
});

// ─── acceleration ─────────────────────────────────────────────────

describe('acceleration', () => {
    it('calculates (vFinal - vInitial) / time', () => {
        const result = acceleration(4.0, 0, 2.0);
        expect(result.value).toBe(2.0);
        expect(result.unit).toBe('m/s²');
    });

    it('returns 0 when time is zero', () => {
        const result = acceleration(10, 0, 0);
        expect(result.value).toBe(0);
    });
});

// ─── weight ──────────────────────────────────────────────────────

describe('weight', () => {
    it('multiplies mass by g (9.81)', () => {
        const result = weight(1.0);
        expect(result.value).toBeCloseTo(9.81, 2);
        expect(result.unit).toBe('N');
    });

    it('calculates correct weight for toy (0.2 kg)', () => {
        const result = weight(0.2);
        expect(result.value).toBeCloseTo(1.962, 2);
    });
});

// ─── netForce ────────────────────────────────────────────────────

describe('netForce', () => {
    it('multiplies mass by acceleration', () => {
        const result = netForce(0.5, 4.0);
        expect(result.value).toBe(2.0);
        expect(result.unit).toBe('N');
    });
});

// ─── dragForce ───────────────────────────────────────────────────

describe('dragForce', () => {
    it('returns weight minus net force', () => {
        const result = dragForce(1.96, 0.8);
        expect(result.value).toBeCloseTo(1.16, 2);
        expect(result.unit).toBe('N');
    });

    it('returns absolute value (drag is always positive)', () => {
        // If net force > weight, drag is still returned as positive
        const result = dragForce(1.0, 3.0);
        expect(result.value).toBeGreaterThanOrEqual(0);
    });
});

// ─── gForceNoBounce ──────────────────────────────────────────────

describe('gForceNoBounce', () => {
    it('calculates g-force from impact velocity and contact time', () => {
        // From spec example: v=2.0, t_contact=0.05 → ~4.08 g
        const result = gForceNoBounce(2.0, 0.05);
        expect(result.value).toBeCloseTo(4.08, 0);
        expect(result.unit).toBe('g');
    });

    it('returns 0 when contact time is zero', () => {
        const result = gForceNoBounce(2.0, 0);
        expect(result.value).toBe(0);
    });
});

// ─── gForceBounce ────────────────────────────────────────────────

describe('gForceBounce', () => {
    it('adds upward velocity to downward impact velocity', () => {
        // From spec: (2.0 + 1.47) / (0.02 × 9.81) ≈ 17.7 g
        const result = gForceBounce(2.0, 1.47, 0.02);
        expect(result.value).toBeCloseTo(17.7, 0);
    });
});

// ─── averageDb ───────────────────────────────────────────────────

describe('averageDb', () => {
    it('averages an array of dB readings', () => {
        const result = averageDb([60, 70, 80]);
        expect(result.value).toBe(70.0);
        expect(result.unit).toBe('dB');
    });

    it('returns 0 for empty readings array', () => {
        const result = averageDb([]);
        expect(result.value).toBe(0);
    });

    it('rounds to 1 decimal place', () => {
        const result = averageDb([60, 61]);
        expect(result.value).toBe(60.5);
    });
});

// ─── hearingRiskLevel ─────────────────────────────────────────────

describe('hearingRiskLevel', () => {
    it('returns Safe for sounds below 60 dB', () => {
        expect(hearingRiskLevel(50)).toContain('Safe');
    });

    it('returns fatigue warning for 60–84 dB range', () => {
        expect(hearingRiskLevel(75)).toContain('fatigue');
    });

    it('returns hearing damage warning at 90 dB', () => {
        expect(hearingRiskLevel(90)).toContain('damage');
    });

    it('returns dangerous at 110 dB', () => {
        expect(hearingRiskLevel(110)).toContain('Dangerous');
    });

    it('returns pain threshold at 125 dB', () => {
        expect(hearingRiskLevel(125)).toContain('Pain threshold');
    });
});

// ─── handFanForce ────────────────────────────────────────────────

describe('handFanForce', () => {
    it('converts degrees to radians before multiplying by k', () => {
        // F = 0.05 × (30° in radians) = 0.05 × 0.5236 ≈ 0.0262
        const result = handFanForce(0.05, 30);
        expect(result.value).toBeCloseTo(0.0262, 3);
        expect(result.unit).toBe('N');
    });
});

// ─── breathsPerMinute ────────────────────────────────────────────

describe('breathsPerMinute', () => {
    it('normalises peak count to per-minute rate', () => {
        // 15 breaths in 60 seconds = 15 BPM
        const result = breathsPerMinute(15, 60);
        expect(result.value).toBe(15.0);
        expect(result.unit).toBe('BPM');
    });

    it('returns 0 when duration is zero', () => {
        const result = breathsPerMinute(10, 0);
        expect(result.value).toBe(0);
    });
});

// ─── movementSpeed ───────────────────────────────────────────────

describe('movementSpeed', () => {
    it('calculates speed as distance / time', () => {
        const result = movementSpeed(5.0, 2.5);
        expect(result.value).toBe(2.0);
        expect(result.unit).toBe('m/s');
    });
});
