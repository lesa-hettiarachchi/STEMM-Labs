// ─── Team ────────────────────────────────────────────────────────

export interface TeamMember {
    id: string;
    firstName: string;
}

export interface Team {
    id: string;
    name: string;
    discriminator: string; 
    gradeLevel: string; 
    schoolName?: string;
    members: TeamMember[];
    createdAt: number; 
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
    sensorType: string; 
    value: number;
    unit: string;
    timestamp: number;
    latitude?: number;  
    longitude?: number; 
    label?: string;    
}

export interface DataTableRow {
    [key: string]: string;
}

export interface ActivityAttempt {
    id: string;
    teamId: string;
    activityId: string;
    iteration: number;
    sensorReadings: SensorReading[];
    dataTableRows: DataTableRow[];
    rating: number; 
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
    url: string; 
    thumbnailUrl?: string;
    type: 'video' | 'image';
    sizeBytes?: number;
    uploadedAt: number;
}
