import type { ActivityAttempt, SensorReading } from '@/constants/types';
import * as SQLite from 'expo-sqlite';

const DB_NAME = 'stemm_labs.db';

let _db: SQLite.SQLiteDatabase | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
    if (!_db) {
        _db = await SQLite.openDatabaseAsync(DB_NAME);
        await initSchema(_db);
    }
    return _db;
}

async function initSchema(db: SQLite.SQLiteDatabase): Promise<void> {
    await db.execAsync(`
        PRAGMA journal_mode = WAL;

        CREATE TABLE IF NOT EXISTS activity_attempts (
            id          TEXT PRIMARY KEY,
            team_id     TEXT NOT NULL,
            activity_id TEXT NOT NULL,
            iteration   INTEGER NOT NULL DEFAULT 1,
            rating      INTEGER NOT NULL DEFAULT 0,
            comment     TEXT NOT NULL DEFAULT '',
            gps_lat     REAL,
            gps_lon     REAL,
            started_at  INTEGER NOT NULL,
            completed_at INTEGER,
            synced      INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS sensor_readings (
            id          TEXT PRIMARY KEY,
            attempt_id  TEXT NOT NULL,
            sensor_type TEXT NOT NULL,
            value       REAL NOT NULL,
            unit        TEXT NOT NULL DEFAULT '',
            timestamp   INTEGER NOT NULL,
            FOREIGN KEY (attempt_id) REFERENCES activity_attempts(id)
        );

        CREATE INDEX IF NOT EXISTS idx_attempts_team   ON activity_attempts(team_id);
        CREATE INDEX IF NOT EXISTS idx_attempts_activity ON activity_attempts(activity_id);
        CREATE INDEX IF NOT EXISTS idx_readings_attempt ON sensor_readings(attempt_id);
    `);
}

// ─── Activity Attempts ───────────────────────────────────────────

export async function saveAttemptLocal(attempt: ActivityAttempt): Promise<void> {
    const db = await getDb();
    await db.runAsync(
        `INSERT OR REPLACE INTO activity_attempts
         (id, team_id, activity_id, iteration, rating, comment,
          gps_lat, gps_lon, started_at, completed_at, synced)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
        attempt.id,
        attempt.teamId,
        attempt.activityId,
        attempt.iteration,
        attempt.rating,
        attempt.comment,
        attempt.gpsLatitude ?? null,
        attempt.gpsLongitude ?? null,
        attempt.startedAt,
        attempt.completedAt ?? null,
    );

    // Save sensor readings in parallel using Promise.all
    await Promise.all(
        attempt.sensorReadings.map((r) => saveSensorReadingLocal(r, attempt.id))
    );
}

async function saveSensorReadingLocal(
    reading: SensorReading,
    attemptId: string
): Promise<void> {
    const db = await getDb();
    await db.runAsync(
        `INSERT OR REPLACE INTO sensor_readings
         (id, attempt_id, sensor_type, value, unit, timestamp)
         VALUES (?, ?, ?, ?, ?, ?)`,
        reading.id,
        attemptId,
        reading.sensorType,
        reading.value,
        reading.unit,
        reading.timestamp,
    );
}

export async function getAttemptsLocal(teamId: string): Promise<ActivityAttempt[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<{
        id: string;
        team_id: string;
        activity_id: string;
        iteration: number;
        rating: number;
        comment: string;
        gps_lat: number | null;
        gps_lon: number | null;
        started_at: number;
        completed_at: number | null;
    }>(
        'SELECT * FROM activity_attempts WHERE team_id = ? ORDER BY started_at DESC',
        teamId
    );

    return Promise.all(
        rows.map(async (row) => {
            const readings = await getSensorReadingsLocal(row.id);
            return {
                id: row.id,
                teamId: row.team_id,
                activityId: row.activity_id,
                iteration: row.iteration,
                rating: row.rating,
                comment: row.comment,
                gpsLatitude: row.gps_lat ?? undefined,
                gpsLongitude: row.gps_lon ?? undefined,
                startedAt: row.started_at,
                completedAt: row.completed_at ?? undefined,
                sensorReadings: readings,
                dataTableRows: [],
            } satisfies ActivityAttempt;
        })
    );
}

async function getSensorReadingsLocal(attemptId: string): Promise<SensorReading[]> {
    const db = await getDb();
    return db.getAllAsync<SensorReading>(
        'SELECT id, sensor_type as sensorType, value, unit, timestamp FROM sensor_readings WHERE attempt_id = ? ORDER BY timestamp ASC',
        attemptId
    );
}

export async function getUnsyncedAttempts(teamId: string): Promise<ActivityAttempt[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<{ id: string }>(
        'SELECT id FROM activity_attempts WHERE team_id = ? AND synced = 0',
        teamId
    );
    return Promise.all(rows.map((r) => getAttemptById(r.id)));
}

async function getAttemptById(id: string): Promise<ActivityAttempt> {
    const db = await getDb();
    const row = await db.getFirstAsync<{
        id: string; team_id: string; activity_id: string;
        iteration: number; rating: number; comment: string;
        gps_lat: number | null; gps_lon: number | null;
        started_at: number; completed_at: number | null;
    }>('SELECT * FROM activity_attempts WHERE id = ?', id);

    if (!row) throw new Error(`Attempt ${id} not found`);
    const readings = await getSensorReadingsLocal(id);
    return {
        id: row.id,
        teamId: row.team_id,
        activityId: row.activity_id,
        iteration: row.iteration,
        rating: row.rating,
        comment: row.comment,
        gpsLatitude: row.gps_lat ?? undefined,
        gpsLongitude: row.gps_lon ?? undefined,
        startedAt: row.started_at,
        completedAt: row.completed_at ?? undefined,
        sensorReadings: readings,
        dataTableRows: [],
    };
}

export async function markAttemptSynced(attemptId: string): Promise<void> {
    const db = await getDb();
    await db.runAsync(
        'UPDATE activity_attempts SET synced = 1 WHERE id = ?',
        attemptId
    );
}

export async function getAttemptCountLocal(
    teamId: string,
    activityId: string
): Promise<number> {
    const db = await getDb();
    const result = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM activity_attempts WHERE team_id = ? AND activity_id = ?',
        teamId,
        activityId
    );
    return result?.count ?? 0;
}

export async function closeDatabase(): Promise<void> {
    if (_db) {
        await _db.closeAsync();
        _db = null;
    }
}
