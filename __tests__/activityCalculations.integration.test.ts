import { calculateActivityResults } from '../services/calculations';

// ─── Parachute Drop ──────────────────────────────────────────────

describe('calculateActivityResults — parachute-drop', () => {
    const params = { distance: 1.5, time: 0.55, mass: 0.2, contactTime: 0.05 };
    let results: ReturnType<typeof calculateActivityResults>;

    beforeAll(() => {
        results = calculateActivityResults('parachute-drop', params);
    });

    it('returns 6 result rows (velocity, accel, net force, weight, drag, g-force)', () => {
        expect(results).toHaveLength(6);
    });

    it('first result is Final Velocity in m/s', () => {
        expect(results[0].name).toBe('Final Velocity');
        expect(results[0].unit).toBe('m/s');
        expect(results[0].value).toBeGreaterThan(0);
    });

    it('weight result is based on mass × 9.81', () => {
        const weightResult = results.find((r) => r.name === 'Weight');
        expect(weightResult).toBeDefined();
        expect(weightResult!.value).toBeCloseTo(0.2 * 9.81, 2);
    });

    it('drag force is positive (parachute slows the fall)', () => {
        const drag = results.find((r) => r.name === 'Drag Force');
        expect(drag!.value).toBeGreaterThanOrEqual(0);
    });
});

// ─── Sound Pollution ─────────────────────────────────────────────

describe('calculateActivityResults — sound-pollution', () => {
    it('returns average and peak from dB readings', () => {
        const readings = [65, 72, 80, 78, 69];
        const results = calculateActivityResults('sound-pollution', {}, readings);

        expect(results).toHaveLength(2);

        const avg = results.find((r) => r.name === 'Average Sound Level');
        expect(avg).toBeDefined();
        expect(avg!.value).toBeCloseTo(72.8, 1);

        const peak = results.find((r) => r.name === 'Peak Sound Level');
        expect(peak!.value).toBe(80);
    });

    it('handles empty readings gracefully', () => {
        const results = calculateActivityResults('sound-pollution', {}, []);
        expect(results[0].value).toBe(0); // avg of empty = 0
    });
});

// ─── Hand Fan ────────────────────────────────────────────────────

describe('calculateActivityResults — hand-fan', () => {
    it('returns one force result with positive value for non-zero angle', () => {
        const results = calculateActivityResults('hand-fan', { springConstant: 0.05, angle: 45 });
        expect(results).toHaveLength(1);
        expect(results[0].name).toBe('Estimated Force');
        expect(results[0].value).toBeGreaterThan(0);
        expect(results[0].unit).toBe('N');
    });

    it('returns 0 force for 0° angle', () => {
        const results = calculateActivityResults('hand-fan', { springConstant: 0.05, angle: 0 });
        expect(results[0].value).toBe(0);
    });
});

// ─── Earthquake Structure ────────────────────────────────────────

describe('calculateActivityResults — earthquake-structure', () => {
    it('returns peak vibration amplitude in mm', () => {
        const results = calculateActivityResults('earthquake-structure', { peakAmplitude: 4.2 });
        expect(results).toHaveLength(1);
        expect(results[0].name).toBe('Peak Vibration Amplitude');
        expect(results[0].value).toBe(4.2);
        expect(results[0].unit).toBe('mm');
    });
});

// ─── Human Performance ───────────────────────────────────────────

describe('calculateActivityResults — human-performance', () => {
    it('returns speed and smoothness score', () => {
        const results = calculateActivityResults('human-performance', {
            distance: 2.0,
            time: 1.0,
            smoothness: 85,
        });
        expect(results).toHaveLength(2);
        expect(results[0].name).toBe('Movement Speed');
        expect(results[0].value).toBe(2.0);
        expect(results[1].name).toBe('Smoothness Score');
        expect(results[1].value).toBe(85);
    });
});

// ─── Reaction Board ──────────────────────────────────────────────

describe('calculateActivityResults — reaction-board', () => {
    it('returns average and best reaction times in ms', () => {
        const results = calculateActivityResults('reaction-board', {
            avgReaction: 320,
            bestReaction: 210,
        });
        expect(results).toHaveLength(2);
        expect(results[0].unit).toBe('ms');
        expect(results[1].value).toBe(210);
    });
});

// ─── Breathing Pace ──────────────────────────────────────────────

describe('calculateActivityResults — breathing-pace', () => {
    it('converts peak count + duration to BPM', () => {
        const results = calculateActivityResults('breathing-pace', { peaks: 18, duration: 60 });
        expect(results).toHaveLength(1);
        expect(results[0].value).toBe(18.0);
        expect(results[0].unit).toBe('BPM');
    });
});

// ─── Unknown Activity ────────────────────────────────────────────

describe('calculateActivityResults — unknown activity', () => {
    it('returns empty array for unrecognised activityId', () => {
        const results = calculateActivityResults('does-not-exist', {});
        expect(results).toEqual([]);
    });
});
