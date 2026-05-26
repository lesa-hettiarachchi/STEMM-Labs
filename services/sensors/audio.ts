export const DBFS_OFFSET = 90;

export interface AudioReading {
  dbFS: number;
  approxDb: number;
  timestamp: number;
}

/** Convert raw dBFS to approximate environmental dB */
export function convertToEnvironmentalDb(dbFS: number): number {
  return Math.max(0, Math.min(130, dbFS + DBFS_OFFSET));
}

export function smoothDb(prev: number, next: number, alpha = 0.25): number {
  return Math.round(alpha * next + (1 - alpha) * prev);
}
export function getHearingRisk(db: number): { level: string; color: string; description: string } {
  if (db < 30) return { level: 'No Risk', color: '#10B981', description: 'Whisper, quiet library' };
  if (db < 60) return { level: 'Safe', color: '#10B981', description: 'Normal conversation, classroom' };
  if (db < 85) return { level: 'Generally Safe', color: '#F59E0B', description: 'Busy traffic — fatigue possible with long exposure' };
  if (db < 90) return { level: 'Damage Possible', color: '#F97316', description: 'Lawn mower, loud classroom' };
  if (db < 100) return { level: 'Damage Likely', color: '#EF4444', description: 'Motorbike, power tools' };
  if (db < 110) return { level: 'Serious Damage', color: '#DC2626', description: 'Nightclub, rock concert' };
  if (db < 120) return { level: 'Painful!', color: '#B91C1C', description: 'Siren, car horn at 1m' };
  return { level: 'Dangerous!', color: '#7F1D1D', description: 'Jet engine — immediate severe damage' };
}
