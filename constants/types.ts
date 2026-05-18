
/**
 * STEMM Labs Data Models
 * Based on ERD from Phase One Design Report
 */

// ─── Team ────────────────────────────────────────────────────────

export interface TeamMember {
    id: string;
    firstName: string;
}

export interface Team {
    id: string;
    name: string;
    discriminator: string; // Auto-generated unique code
    gradeLevel: string; // 'Year 5' – 'Year 9'
    schoolName?: string;
    members: TeamMember[];
    createdAt: number; // timestamp
}

// ─── Activity ────────────────────────────────────────────────────

export type ActivityCategory = 'engineering' | 'health';

export type SensorType =
    | 'camera'
    | 'accelerometer'
    | 'microphone'
    | 'touchscreen'
    | 'timer';

export type ActivityStatus = 'not_started' | 'in_progress' | 'completed';

export interface CurriculumLink {
    subject: string;
    code: string;
    description: string;
}

export interface DataTableColumn {
    key: string;
    label: string;
    editable: boolean;
}

export interface DataTableTemplate {
    columns: DataTableColumn[];
    exampleRows: string[][];
}

export interface ActivityInstruction {
    step: number;
    text: string;
    requiresSensor?: boolean;
    sensorLabel?: string; // e.g. 'Activate Camera', 'Start Sound Meter'
}

export interface ActivityWriteUp {
    prompts: string[];
}

export interface ActivityFormula {
    name: string;
    formula: string;
    example?: string;
    level: 'primary' | 'secondary'; // Student focus level
}

export interface ActivityDefinition {
    id: string;
    name: string;
    shortDescription: string;
    overview: string;
    category: ActivityCategory;
    categoryLabel: string;
    icon: string; // emoji or icon name
    sensorType: SensorType;
    sensorLabel: string;
    keyMeasurement: string;
    equipment: string[];
    instructions: ActivityInstruction[];
    dataTable: DataTableTemplate;
    writeUp: ActivityWriteUp;
    discussion: string;
    formulas: ActivityFormula[];
    curriculumLinks: CurriculumLink[];
    maxIterations: number;
    hasTimer: boolean;
    timerMinutes?: number;
}

// ─── Activity Attempt ────────────────────────────────────────────

export interface SensorReading {
    id: string;
    sensorType: string; // Key in key-value store
    value: number;
    unit: string;
    timestamp: number;
    // Optional enrichment fields — used by Sound Pollution zone mapping
    latitude?: number;  // GPS latitude where reading was taken
    longitude?: number; // GPS longitude where reading was taken
    label?: string;     // Student-entered zone label (e.g. "Front of class")
}

export interface DataTableRow {
    [key: string]: string; // Column key → value
}

export interface ActivityAttempt {
    id: string;
    teamId: string;
    activityId: string;
    iteration: number;
    sensorReadings: SensorReading[];
    dataTableRows: DataTableRow[];
    rating: number; // 1–5 stars
    comment: string;
    gpsLatitude?: number;
    gpsLongitude?: number;
    startedAt: number;
    completedAt?: number;
}

// ─── Leaderboard ─────────────────────────────────────────────────

export interface LeaderboardEntry {
    id: string;
    teamId: string;
    teamName: string;
    teamDiscriminator: string;
    schoolName?: string;
    gradeLevel: string;
    activityId: string;
    bestScore: number;
    bestScoreUnit: string;
    dateAchieved: number;
}

// ─── Media ───────────────────────────────────────────────────────

export interface MediaFile {
    id: string;
    attemptId: string;
    url: string; // Cloud storage URL
    thumbnailUrl?: string;
    type: 'video' | 'image';
    sizeBytes?: number;
    uploadedAt: number;
}
