/**
 * Firestore CRUD Operations
 */

import type {
    ActivityAttempt,
    LeaderboardEntry,
    Team,
} from '@/constants/types';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where,
} from 'firebase/firestore';
import { db } from './firebase';

// ─── Collections ─────────────────────────────────────────────────
const TEAMS = 'teams';
const ATTEMPTS = 'activityAttempts';
const LEADERBOARD = 'leaderboard';

// ─── Teams ───────────────────────────────────────────────────────

export async function createTeam(team: Team): Promise<void> {
    await setDoc(doc(db, TEAMS, team.id), {
        ...team,
        createdAt: serverTimestamp(),
    });
}

export async function getTeam(teamId: string): Promise<Team | null> {
    const snap = await getDoc(doc(db, TEAMS, teamId));
    return snap.exists() ? (snap.data() as Team) : null;
}

export async function updateTeam(
    teamId: string,
    updates: Partial<Team>
): Promise<void> {
    await updateDoc(doc(db, TEAMS, teamId), updates);
}

// ─── Activity Attempts ───────────────────────────────────────────

export async function saveAttempt(attempt: ActivityAttempt): Promise<void> {
    await setDoc(doc(db, ATTEMPTS, attempt.id), {
        ...attempt,
        completedAt: serverTimestamp(),
    });
}

export async function getAttemptsByTeam(
    teamId: string,
    activityId?: string
): Promise<ActivityAttempt[]> {
    let q;
    if (activityId) {
        q = query(
            collection(db, ATTEMPTS),
            where('teamId', '==', teamId),
            where('activityId', '==', activityId),
            orderBy('iteration', 'asc')
        );
    } else {
        q = query(
            collection(db, ATTEMPTS),
            where('teamId', '==', teamId)
        );
    }
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as ActivityAttempt);
}

// ─── Leaderboard ─────────────────────────────────────────────────

export async function upsertLeaderboardEntry(
    entry: LeaderboardEntry
): Promise<void> {
    const entryId = `${entry.teamId}_${entry.activityId}`;
    const existing = await getDoc(doc(db, LEADERBOARD, entryId));

    if (!existing.exists() || entry.bestScore > existing.data().bestScore) {
        await setDoc(doc(db, LEADERBOARD, entryId), {
            ...entry,
            id: entryId,
            dateAchieved: serverTimestamp(),
        });
    }
}

export async function getLeaderboard(
    activityId: string,
    gradeFilter?: string,
    maxResults: number = 50
): Promise<LeaderboardEntry[]> {
    let q;
    if (gradeFilter) {
        q = query(
            collection(db, LEADERBOARD),
            where('activityId', '==', activityId),
            where('gradeLevel', '==', gradeFilter),
            orderBy('bestScore', 'desc'),
            limit(maxResults)
        );
    } else {
        q = query(
            collection(db, LEADERBOARD),
            where('activityId', '==', activityId),
            orderBy('bestScore', 'desc'),
            limit(maxResults)
        );
    }
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as LeaderboardEntry);
}
