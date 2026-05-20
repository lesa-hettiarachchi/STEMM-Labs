import { ActivityDefinition } from './types';

export const ACTIVITIES: ActivityDefinition[] = [
    // ════════════════════════════════════════════════════
    // ENGINEERING CHALLENGES
    // ════════════════════════════════════════════════════

    {
        id: 'parachute-drop',
        name: 'Parachute Drop Challenge',
        shortDescription: 'Design and test parachutes to reduce landing speed.',
        overview:
            'Students design, build, and test a parachute for a small toy to reduce its landing speed and impact force. Teams iterate their designs under time and material constraints, aiming to achieve the slowest and safest landing within a target area.',
        category: 'engineering',
        categoryLabel: 'Engineering + Physics',
        icon: '🪂',
        sensorType: 'camera',
        sensorLabel: 'Camera (slow-motion video)',
        keyMeasurement: 'Drop time, velocity, drag force, g-force',
        equipment: [
            'Mobile phone with STEMM Labs app',
            'Small toy (e.g. army toy soldier)',
            'Table or elevated surface',
            'Paper or plastic',
            'String',
            'Scissors',
            'Tape',
        ],
        instructions: [
            { step: 1, text: 'Drop the toy without a parachute and record the fall (baseline test).', requiresSensor: true, sensorLabel: 'Start Recording' },
            { step: 2, text: 'Build a parachute using provided materials.' },
            { step: 3, text: 'Drop the toy from the same height and record the fall.', requiresSensor: true, sensorLabel: 'Start Recording' },
            { step: 4, text: 'Review speed and landing accuracy results in the app.' },
            { step: 5, text: 'Redesign and test up to three prototypes within 20 minutes.' },
            { step: 6, text: 'Upload videos, results, and team reflections.' },
        ],
        dataTable: {
            columns: [
                { key: 'action', label: 'Action / Design', editable: true },
                { key: 'predicted', label: 'Predicted time to hit ground', editable: true },
                { key: 'actual', label: 'Actual time to first hit ground', editable: true },
                { key: 'correct', label: 'Were you right?', editable: true },
                { key: 'slowmo', label: 'Time from first hit to stop moving (slow-motion)', editable: true },
            ],
            exampleRows: [
                ['No parachute (baseline)', '', '', '', ''],
                ['e.g. plastic with four corners tied to toy', '', '', '', ''],
                ['Design 3', '', '', '', ''],
            ],
        },
        writeUp: {
            prompts: [
                'Predict which parachute design was the best.',
                'Sketch each design.',
                'Record the times of each design.',
                'Were you correct in your timings?',
                'What design was the easiest to make?',
            ],
        },
        discussion:
            'Gravity pulls objects downward, causing them to speed up as they fall. A parachute increases air resistance (drag). Drag acts upward, opposing the motion and slowing the fall. A slower fall reduces the force when the toy hits the ground, making the landing safer. Engineers improve parachute designs through repeated testing and redesign.',
        formulas: [
            { name: 'Final Velocity', formula: 'v = distance / time', example: '1.0 m / 0.5 s = 2.0 m/s', level: 'primary' },
            { name: 'Acceleration', formula: 'a = (v_final − v_initial) / time', example: '(2.0 − 0) / 0.5 = 4.0 m/s²', level: 'secondary' },
            { name: 'Net Force', formula: 'F_net = mass × acceleration', example: '0.20 × 4.0 = 0.8 N', level: 'secondary' },
            { name: 'Weight', formula: 'W = mass × g', example: '0.20 × 9.8 = 1.96 N', level: 'secondary' },
            { name: 'Drag Force', formula: 'F_drag = Weight − Net Force', example: '1.96 − 0.8 = 1.16 N', level: 'secondary' },
            { name: 'G-Force (no bounce)', formula: 'g = (v_impact / t_contact) ÷ 9.8', example: '(2.0 / 0.05) ÷ 9.8 ≈ 4.1 g', level: 'secondary' },
            { name: 'G-Force (bounce)', formula: 'g = ((v_impact + v_up) / t_contact) ÷ 9.8', example: '((2.0 + 1.47) / 0.02) ÷ 9.8 ≈ 17.7 g', level: 'secondary' },
        ],
        curriculumLinks: [
            { subject: 'Science', code: 'ACSSU076 / ACSSU117', description: 'Forces affect motion' },
            { subject: 'Science', code: 'ACSIS124', description: 'Planning and conducting investigations' },
            { subject: 'Science', code: 'ACSIS126', description: 'Analysing patterns in data' },
            { subject: 'Design & Technologies', code: 'ACTDEP036', description: 'Generate, test, and improve solutions' },
            { subject: 'Mathematics', code: 'ACMMG108', description: 'Measuring speed' },
            { subject: 'Mathematics', code: 'ACMSP147', description: 'Comparing data and averages' },
        ],
        // All 3 parachute designs are recorded inside one session via the
        maxIterations: 1,
        hasTimer: true,
        timerMinutes: 20,
    },

    {
        id: 'sound-pollution',
        name: 'Sound Pollution Hunter',
        shortDescription: 'Measure and compare sound levels in your environment.',
        overview:
            'Students measure and compare sound levels in different classroom activities.',
        category: 'engineering',
        categoryLabel: 'Environmental Science',
        icon: '🔊',
        sensorType: 'microphone',
        sensorLabel: 'Microphone (dB meter)',
        keyMeasurement: 'Sound level (dB)',
        equipment: ['Mobile phone with STEMM Labs app'],
        instructions: [
            { step: 1, text: 'Measure noise from different actions (dropping objects — pens, books — talking, walking, stamping your feet).', requiresSensor: true, sensorLabel: 'Start Sound Meter' },
            { step: 2, text: 'Record sound levels and locations.' },
            { step: 3, text: 'Map loud and quiet zones.' },
        ],
        dataTable: {
            columns: [
                { key: 'action', label: 'Action', editable: true },
                { key: 'prediction', label: 'Prediction (louder or softer than)', editable: true },
                { key: 'outcome', label: 'Outcome (dB)', editable: true },
                { key: 'correct', label: 'Were you right?', editable: true },
            ],
            exampleRows: [
                ['e.g. dropping a book on the table', '', '', ''],
                ['Action 2', '', '', ''],
                ['Action 3', '', '', ''],
            ],
        },
        writeUp: {
            prompts: [
                'Predict which action created the loudest sound.',
                'Record the results.',
                'Were you right? Any surprises?',
                'Should we wear ear muffs in your classroom?',
            ],
        },
        discussion:
            'Sound intensity varies depending on energy and surfaces. Prolonged loud noise can impact health and concentration.',
        formulas: [
            { name: 'Sound Level', formula: 'Measured in decibels (dB)', level: 'primary' },
        ],
        curriculumLinks: [
            { subject: 'Science', code: 'ACSSU073', description: 'Sound and energy' },
            { subject: 'Health', code: 'ACPPS053', description: 'Health and wellbeing' },
        ],
        maxIterations: 1,
        hasTimer: false,
    },

    {
        id: 'hand-fan',
        name: 'Hand Fan Challenge',
        shortDescription: 'Test how air movement affects flexible materials.',
        overview:
            'Students test how air movement affects flexible materials.',
        category: 'engineering',
        categoryLabel: 'Physics – Air Movement',
        icon: '🌬️',
        sensorType: 'accelerometer',
        sensorLabel: 'Accelerometer (bend angle)',
        keyMeasurement: 'Bend angle (degrees)',
        equipment: [
            'Paper and cardboard',
            'Scissors',
            'Mobile phone',
            'Sticky tape',
            'STEMM Labs app',
        ],
        instructions: [
            { step: 1, text: 'Stand paper upright on a table.' },
            { step: 2, text: 'Fan air from 30 cm away.' },
            { step: 3, text: 'Observe and record movement.', requiresSensor: true, sensorLabel: 'Activate Accelerometer' },
            { step: 4, text: 'Repeat with different fan designs and fan distances (15 cm, 30 cm, 45 cm).' },
            { step: 5, text: 'Repeat with cardboard instead of paper as the vertical material.' },
        ],
        dataTable: {
            columns: [
                { key: 'design', label: 'Design', editable: true },
                { key: 'predicted', label: 'Predicted bend (degrees)', editable: true },
                { key: 'outcome', label: 'Outcome (degrees)', editable: true },
                { key: 'notes', label: 'Observation notes', editable: true },
            ],
            exampleRows: [
                ['e.g. 1 cm back-and-forward folds', '30°', '', ''],
                ['e.g. no folds', '', '', ''],
                ['Design 3', '', '', ''],
            ],
        },
        writeUp: {
            prompts: [
                'Predict which fan design makes the paper move the most.',
                'Record the results.',
                'Were you right? Any surprises?',
                'How does material stiffness affect the bend angle?',
                'How does fan design influence air velocity and resulting paper movement?',
                'How does distance from the fan affect bending?',
            ],
        },
        discussion:
            'Moving air applies force to objects. Paper bends due to flexibility (plasticity), and repeated bending can weaken it.',
        formulas: [
            { name: 'Force Estimation', formula: 'F ≈ k × θ', example: 'Thin paper: 0.05 × 0.524 ≈ 0.026 N', level: 'secondary' },
            { name: 'Stiffness Coefficient', formula: 'k varies by material thickness', example: 'Thin paper k=0.05, Card stock k=0.2, Thin cardboard k=0.5', level: 'secondary' },
        ],
        curriculumLinks: [
            { subject: 'Science', code: 'ACSSU076', description: 'Forces and motion' },
        ],

        maxIterations: 1,
        hasTimer: false,
    },

    {
        id: 'earthquake-structure',
        name: 'Earthquake-Resistant Structure',
        shortDescription: 'Design structures that withstand vibration.',
        overview:
            'Students design structures that withstand vibration, simulating earthquakes.',
        category: 'engineering',
        categoryLabel: 'Engineering + Earth Science',
        icon: '🏗️',
        sensorType: 'accelerometer',
        sensorLabel: 'Accelerometer (vibration)',
        keyMeasurement: 'Vibration amplitude (mm)',
        equipment: [
            'Cardboard, paper, scissors, sticky tape, plastic/paper cups',
            'Mobile phone with vibration sensor',
        ],
        instructions: [
            { step: 1, text: 'Build an anti-vibration layer by folding paper/cardboard.' },
            { step: 2, text: 'Place a flat cardboard platform on top.' },
            { step: 3, text: 'Place the phone in the centre and activate vibration mode on the STEMM App.', requiresSensor: true, sensorLabel: 'Activate Vibration Sensor' },
            { step: 4, text: 'Modify the structure to reduce movement (e.g. more pillars, more folds, etc.).' },
        ],
        dataTable: {
            columns: [
                { key: 'design', label: 'Design', editable: true },
                { key: 'predicted', label: 'Predicted phone movement', editable: true },
                { key: 'outcome', label: 'Outcome (mm)', editable: true },
                { key: 'correct', label: 'Were you right?', editable: true },
            ],
            exampleRows: [
                ['e.g. 4 folds + 4 pillars', 'e.g. ±1 cm', '4 cm', ''],
                ['e.g. 10 folds + 4 pillars', '', '', ''],
                ['e.g. 3 folds + 6 pillars', '', '', ''],
            ],
        },
        writeUp: {
            prompts: [
                'Predict which fold design makes the phone move the least.',
                'Record the results.',
                'Were you right? Any surprises?',
            ],
        },
        discussion:
            'Earthquakes cause ground vibrations that can collapse poorly designed structures. Engineers design buildings to absorb and distribute energy safely.',
        formulas: [],
        curriculumLinks: [
            { subject: 'Science', code: 'ACSSU096', description: 'Earth processes' },
            { subject: 'Design & Technologies', code: 'ACTDEP036', description: 'Testing and improving designs' },
        ],
        maxIterations: 1,
        hasTimer: false,
    },

    // ════════════════════════════════════════════════════
    // HEALTH AND MEDICAL SCIENCES
    // ════════════════════════════════════════════════════

    {
        id: 'human-performance',
        name: 'Human Performance Lab',
        shortDescription: 'Measure speed, smoothness, and coordination.',
        overview:
            'Students investigate how the human body moves by measuring speed, smoothness, and coordination during controlled stretching activities.',
        category: 'health',
        categoryLabel: 'Medical Science + Biomechanics',
        icon: '🏃',
        sensorType: 'accelerometer',
        sensorLabel: 'Accelerometer (vibration/smoothness)',
        keyMeasurement: 'Smoothness score, movement time',
        equipment: [
            'Mobile phone with STEMM Labs app',
            'Open space to move safely',
        ],
        instructions: [
            { step: 1, text: 'Hold the phone firmly in one hand. Activate the app vibration sensor.', requiresSensor: true, sensorLabel: 'Activate Vibration Sensor' },
            { step: 2, text: 'Perform guided movement slowly as shown in the app. Record the vibration.' },
            { step: 3, text: 'Repeat the activity with vibration feedback enabled.' },
            { step: 4, text: 'Review speed, smoothness, and range-of-motion data.' },
            { step: 5, text: 'Upload results and reflect as a group.' },
        ],
        dataTable: {
            columns: [
                { key: 'attempt', label: 'Attempt', editable: false },
                { key: 'predicted', label: 'Predicted phone vibration', editable: true },
                { key: 'outcome', label: 'Outcome (time + movement)', editable: true },
                { key: 'correct', label: 'Were you right?', editable: true },
            ],
            exampleRows: [
                ['Attempt 1', 'e.g. ±1 cm', '5 mm in 20 seconds', ''],
                ['Attempt 2', '', '5 mm in 5 seconds', ''],
                ['Attempt 3', '', '', ''],
            ],
        },
        writeUp: {
            prompts: [
                'Which movement was the hardest to keep the vibration low?',
                'Record the results.',
                'Were you right? Any surprises?',
            ],
        },
        discussion:
            'Muscles and joints work together to create movement. Faster movements often reduce control, while smoother movements show better coordination. Sensors in the phone measure how quickly and smoothly the body moves, helping students understand biomechanics and fatigue.',
        formulas: [],
        curriculumLinks: [
            { subject: 'Health & Physical Education', code: 'ACPPS051', description: 'Movement skills' },
            { subject: 'Health & Physical Education', code: 'ACPPS054', description: 'Physical performance' },
            { subject: 'Science (Biology)', code: 'ACSSU176', description: 'Structure and function of body systems' },
        ],
        maxIterations: 3,
        hasTimer: false,
    },

    {
        id: 'reaction-board',
        name: 'Reaction Board Challenge',
        shortDescription: 'Measure reaction time and coordination.',
        overview:
            'Students measure reaction time, coordination, and improvement through repeated digital and physical challenges.',
        category: 'health',
        categoryLabel: 'Neuroscience + Mathematics',
        icon: '⚡',
        sensorType: 'touchscreen',
        sensorLabel: 'Touchscreen timer',
        keyMeasurement: 'Reaction time (ms)',
        equipment: [
            'Mobile phone with STEMM Labs app',
            'Clear working space',
        ],
        instructions: [
            { step: 1, text: 'Phase 1 – Tap Reaction: Tap the screen as soon as the hidden button appears.' },
            { step: 2, text: 'Record reaction time.', requiresSensor: true, sensorLabel: 'Start Reaction Test' },
            { step: 3, text: 'Rotate through each team member.' },
            { step: 4, text: 'Phase 2 – Swap Hands: Repeat using the non-dominant hand.' },
            { step: 5, text: 'Compare results between dominant and non-dominant hand.' },
            { step: 6, text: 'Rotate through each team member.' },
            { step: 7, text: 'Phase 3 – Tracing Challenge: Trace a moving shape on the screen.' },
            { step: 8, text: 'Review accuracy and delay.' },
            { step: 9, text: 'Rotate through each team member.' },
        ],
        dataTable: {
            columns: [
                { key: 'attempt', label: 'Attempt', editable: false },
                { key: 'predicted', label: 'Reaction time prediction', editable: true },
                { key: 'outcome', label: 'Outcome (time + movement)', editable: true },
                { key: 'correct', label: 'Were you right?', editable: true },
            ],
            exampleRows: [
                ['Attempt 1', 'e.g. ±1 cm', '6 seconds delay', ''],
                ['Attempt 2', '', '3 seconds delay', ''],
                ['Attempt 3', '', '', ''],
            ],
        },
        writeUp: {
            prompts: [
                'Predict your reaction time.',
                'Record the results.',
                'Were you right? Any surprises?',
            ],
        },
        discussion:
            'Reaction time measures how quickly the brain processes information and sends signals to muscles. Practice can improve speed and coordination. Comparing hands shows how dominance affects performance.',
        formulas: [],
        curriculumLinks: [
            { subject: 'Science Inquiry', code: 'ACSIS130', description: 'Collecting and analysing data' },
            { subject: 'Mathematics', code: 'ACMSP147', description: 'Averages and variation' },
            { subject: 'Health', code: 'ACPPS057', description: 'Understanding physical performance' },
        ],
        maxIterations: 1,
        hasTimer: false,
    },

    {
        id: 'breathing-pace',
        name: 'Breathing Pace Trainer',
        shortDescription: 'Analyse breathing patterns at rest and after exercise.',
        overview:
            'Students analyse breathing patterns at rest and after exercise.',
        category: 'health',
        categoryLabel: 'Medical Science',
        icon: '🫁',
        sensorType: 'accelerometer',
        sensorLabel: 'Accelerometer (chest movement)',
        keyMeasurement: 'Breaths per minute, amplitude',
        equipment: [
            'Mobile phone with STEMM Labs app',
            'Flat surface or mat',
        ],
        instructions: [
            { step: 1, text: 'Place the phone gently on the chest.' },
            { step: 2, text: 'Record breathing at rest.', requiresSensor: true, sensorLabel: 'Start Breathing Sensor' },
            { step: 3, text: 'Perform light exercise: Jog one minute on the spot, or 100 star jumps.' },
            { step: 4, text: 'Record breathing again and compare results.', requiresSensor: true, sensorLabel: 'Start Breathing Sensor' },
            { step: 5, text: 'Rotate for each team member.' },
        ],
        dataTable: {
            columns: [
                { key: 'condition', label: 'Condition', editable: false },
                { key: 'predicted', label: 'Predicted breaths per minute', editable: true },
                { key: 'outcome', label: 'Outcome (time + movement)', editable: true },
                { key: 'correct', label: 'Were you right?', editable: true },
            ],
            exampleRows: [
                ['Breathing at Rest', 'e.g. 6 breaths per minute', '', ''],
                ['After Exercise 1', '', '', ''],
                ['After Exercise 2', '', '', ''],
            ],
        },
        writeUp: {
            prompts: [
                'Before you start: predict how many breaths per minute you take at rest (sitting still).',
                'After exercise: predict by how much your breathing rate will increase.',
                'Record your actual breathing rate for each condition (rest, after exercise 1, after exercise 2).',
                'Compare your prediction to the results — were you right? How much did the rate change?',
                'Why does your breathing speed up during exercise? Which body systems are involved?',
            ],
        },
        discussion:
            'Breathing rate increases during exercise to supply more oxygen to muscles. Sensors detect chest movement, helping students visualise breathing patterns.',
        formulas: [],
        curriculumLinks: [
            { subject: 'Science', code: 'ACSSU176', description: 'Body systems' },
            { subject: 'Health', code: 'ACPPS054', description: 'Physical activity and health' },
        ],
        maxIterations: 1,
        hasTimer: false,
    },
];

// ─── Helper Accessors ────────────────────────────────────────────

export const ENGINEERING_ACTIVITIES = ACTIVITIES.filter(a => a.category === 'engineering');
export const HEALTH_ACTIVITIES = ACTIVITIES.filter(a => a.category === 'health');

export function getActivityById(id: string): ActivityDefinition | undefined {
    return ACTIVITIES.find(a => a.id === id);
}
