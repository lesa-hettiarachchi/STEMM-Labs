# STEMM Lab – Phase One Design Report

**Subject:** CSE3MAD – Mobile Application Development  
**Assessment:** Assessment 1 – Phase One Design Report  
**Student Name:** Lesandu Hetti Arachchige  
**Student Number:** 21533031  
**Date:** 20 March 2026  

> *A Real-World STEMM Games App*

---

## Table of Contents

1. [Lean Canvas](#1-lean-canvas)
2. [Entity-Relationship Diagram (ERD)](#2-entity-relationship-diagram-erd)
3. [Screen Planning Document](#3-screen-planning-document)
4. [User Flow Diagram](#4-user-flow-diagram)
5. [Wireframes](#5-wireframes)
6. [Libraries](#6-libraries)
7. [Themes](#7-themes)
8. [Tools and Sources Acknowledged](#8-tools-and-sources-acknowledged)

---

## 1. Lean Canvas

> *(Visual canvas image in original document — refer to Figma wireframe link in Section 5 for full design context.)*

---

## 2. Entity-Relationship Diagram (ERD)

### 2.1 ERD

> *(ERD diagram image in original document — refer to DrawIO source for visual reference.)*

### 2.2 Key Design Decisions

**Sensor_Reading uses a key-value structure:**  
Because each activity captures a different type of sensor data (sound in dB, drop time in seconds, vibration amplitude in mm), a normalised key-value store for sensor readings avoids the need for separate tables per activity. The `sensorType` field acts as the key.

**Leaderboard_Entry is a separate entity:**  
Rather than computing the best result on the fly from Activity Attempt records, a dedicated `Leaderboard_Entry` entity is maintained and updated when a new best is recorded. This makes leaderboard queries fast and avoids full-table scans.

**Media_File stores only metadata:**  
Actual video files can be large (10–100 MB each). Storing them in cloud object storage (e.g. Firebase Storage or AWS S3) and recording only the URL in the database is best practice for mobile applications.

---

## 3. Screen Planning Document

### 3.1 Onboarding & Team Setup Screens

#### Screen 1: Splash / Launch Screen

- Displays the STEMM Lab logo and application name on first launch.
- Checks whether a team profile already exists in local storage.
- If a profile exists, automatically navigates to the Home Screen after a brief delay.
- If no profile exists, navigates to the Team Registration Screen.

#### Screen 2: Team Registration Screen

- Presented on first launch only (or when the user chooses to reset their team).
- Input fields: Team Name (text), Grade or Year Level (spinner/dropdown: Year 5–Year 9), School Name (optional text).
- Dynamically displays a member entry row; tapping 'Add Member' adds an additional first-name input field (minimum 1 member, maximum 6 members).
- On confirmation, the app generates a unique Team Discriminator code and saves the team profile locally and to the cloud database.
- Validates that the team name is not empty and at least one member's first name is entered before allowing progression.

#### Screen 3: Team Profile Screen

- Accessible from the Home Screen via a profile icon.
- Displays team name, discriminator, grade level, member list, and school name.
- Provides an 'Edit Profile' button to update non-critical fields (school name, member names).
- Shows a summary of the team's total activities completed and their current global leaderboard ranking.

---

### 3.2 Main Navigation Screens

#### Screen 4: Home Screen

- The primary landing screen after setup.
- Uses a card-based layout displaying all seven activities organised by category (Engineering Challenges, Health and Medical Sciences).
- Each activity card shows: activity name, brief one-line description, STEMM category, completion status indicator (not started / in progress / completed), and the team's current best score if applicable.
- A persistent bottom navigation bar provides access to: Home, Leaderboard, and Team Profile.
- A notification badge on activity cards indicates if a timed challenge is currently active.

#### Screen 5: Leaderboard Screen

- Displays global and school-level leaderboards for each activity.
- A tab bar at the top allows switching between activities (or 'All Activities' for a combined points view).
- Each leaderboard row shows: rank, team name + discriminator, school name, best score, and date achieved.
- The current team's row is highlighted for easy identification.
- A filter option allows the user to view the leaderboard by grade level to ensure fair comparison.

---

### 3.3 Activity Screens (Per-Activity Common Structure)

Each of the seven activities follows a consistent four-screen pattern. The screens below describe this pattern using the **Parachute Drop Challenge** as the example, but the same structure applies to all activities.

#### Screen 6: Activity Overview Screen

- Displays the activity title, STEMM category, curriculum codes, a brief overview paragraph, and required equipment list.
- Shows the team's current iteration number (e.g. Iteration 1 of 3) and their best result to date.
- A 'Start Activity' button initiates the sensor session and navigates to the Activity Instructions Screen.
- A 'View Results' button is available if the team has previously completed at least one iteration.

#### Screen 7: Activity Instructions Screen

- Presents numbered step-by-step instructions for the current activity.
- Each step is displayed one at a time with 'Next' and 'Back' navigation buttons, minimising cognitive load.
- Steps that require sensor activation display a prominent 'Activate Sensor' button (e.g. 'Activate Camera for slow-motion video', 'Start Sound Level Meter').
- A timer is displayed at the top of the screen when the activity has a time constraint (e.g. 20-minute parachute design window).

#### Screen 8: Data Recording Screen

The central data capture screen for each activity. Displays sensor readings in real time as the experiment runs.

| Activity | Sensor Data Displayed |
|---|---|
| Parachute Drop | Drop time (from video analysis), computed velocity and force values |
| Sound Pollution Hunter | Live dB meter, graph of sound levels over time, peak dB indicator |
| Hand Fan Challenge | Accelerometer-derived bend angle in degrees |
| Earthquake Structure | Accelerometer vibration amplitude (mm) in real time |
| Human Performance Lab | Smoothness score (low vibration = high smoothness) and movement time |
| Reaction Board Challenge | Tap target that appears randomly; reaction time measured in milliseconds |
| Breathing Pace Trainer | Chest movement amplitude and estimated breaths-per-minute, graphed over time |

- A 'Save Reading' button saves the current sensor data to the `ActivityAttempt` record. Multiple readings can be saved per attempt.
- A star rating control (1–5) and a comment/reflection text box are provided at the bottom of the screen.

#### Screen 9: Results & Reflection Screen

- Shown after the team confirms their data entry is complete.
- Displays a summary table comparing all iterations attempted (if applicable).
- Computes and displays calculated values (e.g. velocity, drag force, g-force for Parachute; stiffness ranking for Hand Fan).
- Provides a clearly labelled 'Upload Evidence' button to attach slow-motion video or images.
- Shows the team's updated leaderboard position for this activity if their result qualifies.
- An 'Iterate Again' button (available if iterations remain) navigates back to the Activity Instructions Screen for the next prototype.
- A 'Return to Home' button navigates back to the Home Screen.

---

### 3.4 Supporting Screens

#### Screen 10: Video Capture Screen

- A full-screen camera view activated when the activity requires video evidence.
- Supports both standard and slow-motion recording modes depending on device capability.
- A frame ruler overlay can be toggled on to assist students in measuring distance and scale from video.
- On completion, the video is trimmed (optional), then uploaded to cloud storage and linked to the active `ActivityAttempt` record.

#### Screen 11: Help & Curriculum Screen

- Accessible from any activity screen via a '?' icon.
- Displays the full discussion section for the current activity in plain language, explaining the underlying science.
- For secondary students, shows the relevant formulas (force, velocity, g-force, etc.) with worked examples.
- Provides a link to the relevant ACARA curriculum outcome pages for teacher reference.

#### Screen 12: Settings Screen

- Accessible from the Home Screen.
- Allows the user to toggle between Light Mode and Dark Mode.
- Provides a text size adjustment slider (Normal, Large, Extra-Large) to support accessibility.
- Includes an option to clear all locally stored data and start fresh (requires confirmation).
- Displays app version and acknowledgements.

---

## 4. User Flow Diagram

### 4.1 First Launch Flow

When the application is opened for the first time on a device, or after a complete data reset:

```
Splash Screen → (no team profile found) → Team Registration Screen → (team saved successfully) → Home Screen
```

If the user taps the back button during Team Registration before completing setup, the app remains on the Team Registration Screen. A confirmation dialog reminds the student that registration must be completed before the app can be used.

### 4.2 Returning User Flow

When the application is opened on a device that already has a registered team:

```
Splash Screen → (team profile found) → Home Screen
```

The user can navigate to the Team Profile Screen at any time from the Home Screen via the bottom navigation bar. From the Team Profile Screen, the user can return to the Home Screen using the back arrow.

### 4.3 Completing an Activity (Core Flow)

```
Home Screen
  → (tap activity card) → Activity Overview Screen
  → (tap 'Start Activity') → Activity Instructions Screen
  → (navigate through steps, activate sensors as prompted) → Data Recording Screen
  → (sensor data captured, rating and comments entered)
  → (tap 'Save & Continue') → Results & Reflection Screen
```

From the Results & Reflection Screen, three exit paths exist:

- **'Iterate Again'** (if iterations remain) → navigates back to Activity Instructions Screen with iteration counter incremented.
- **'Upload Evidence'** → navigates to Video Capture Screen → (recording complete, file uploaded) → returns to Results & Reflection Screen.
- **'Return to Home'** → navigates back to Home Screen, with the activity card updated to show the completed status and best score.

### 4.5 Leaderboard Navigation

```
Home Screen (or any main screen) → (tap Leaderboard tab) → Leaderboard Screen → (tap activity tab to filter) → (view rankings)
```

The Leaderboard Screen does not lead to any sub-screens. The back button or bottom navigation bar returns the user to their previous context.

### 4.6 Help Navigation

The Help & Curriculum Screen is contextual. It always returns the user to the screen from which it was accessed:

```
(Any Activity Screen) → (tap '?' icon) → Help & Curriculum Screen → (tap back) → (return to originating activity screen)
```

### 4.7 Settings Navigation

```
Home Screen → (tap gear icon) → Settings Screen → (adjust theme/font size/data settings) → (tap back) → Home Screen with new settings applied
```

If the user opts to clear all data, a confirmation dialog is shown. On confirmation, all locally stored team data, attempt records, and sensor readings are deleted, and the app restarts the First Launch Flow from the Splash Screen.

---

## 5. Wireframes

- **Interactive Prototype:** [Figma Prototype](https://www.figma.com/proto/TXO6a9MfI4QB7jWFxUuNME/STEMM-Labs?node-id=30-283&p=f&t=BvFRyNUWDE5dND54-1&scaling=scale-down&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=30%3A283)
- **Wireframe File:** [Figma Design File](https://www.figma.com/design/TXO6a9MfI4QB7jWFxUuNME/STEMM-Labs?node-id=0-1&t=ZQaBaJT8SDSbA3C2-1)

> Note: Only one page of the dark mode is included in the wireframe.

---

## 6. Libraries

### 6.1 UI Component Libraries

| Library | Description & Rationale |
|---|---|
| React Native + Expo | React Native with Expo provides a JavaScript-based framework that compiles to native components. Expo's sensor API simplifies access to the accelerometer, microphone, and camera. License: MIT. Source: expo.dev |

### 6.2 Sensor & Hardware Access Libraries

| Library | Description & Rationale |
|---|---|
| Expo Sensors (cross-platform) | Provides a unified API for Accelerometer, Gyroscope, Barometer, and DeviceMotion across Android and iOS. License: MIT. Source: docs.expo.dev/versions/latest/sdk/sensors |
| Expo AV / expo-camera | Provides video recording and playback capabilities in the Expo/React Native environment. Supports slow-motion video capture on supported devices. License: MIT. Source: docs.expo.dev/versions/latest/sdk/camera |

### 6.3 Data Visualisation Libraries

| Library | Description & Rationale |
|---|---|
| Victory Native (React Native) | A charting library for React Native applications. Provides animated, responsive charts suitable for both real-time sensor display and results comparison. License: MIT. Source: formidable.com/open-source/victory/docs/native |
| Recharts | If a web-based (React Native Web) approach is used, Recharts provides composable, responsive chart components. License: MIT. Source: recharts.org |

### 6.4 Networking & Cloud Storage Libraries

| Library | Description & Rationale |
|---|---|
| Firebase SDK (Firestore + Storage + Auth) | Google Firebase provides a real-time NoSQL database (Firestore) for storing team registrations, activity attempts, sensor readings, and leaderboard entries. Firebase Storage handles media file uploads. Firebase Anonymous Authentication allows teams to register without requiring email/password credentials. License: Free tier available (Spark Plan). Source: firebase.google.com |

---

## 7. Themes

STEMM Lab implements both a **Light Mode** and a **Dark Mode** theme, following Material Design 3 theming guidelines. The theme applies across all screens and components consistently, with no screen requiring individual theming overrides.

### 7.1 Light Mode Colour Palette

Light Mode is the default theme — vibrant and energetic, appropriate for a hands-on, active learning environment. Blues and greens convey scientific precision and environmental awareness.

| Token | Hex Value | Usage |
|---|---|---|
| Primary | `#1A9B7B` | Primary buttons, app icon, section header banners, active nav icon |
| Primary Variant | `#2563EB` | Engineering section header, active tab underline, curriculum code chips |
| Secondary | `#10B981` | Health & Medical section header, best score chips, health activity card stripe |
| Secondary Variant | `#059669` | Hover/pressed states for secondary buttons |
| Background | `#F0F2F5` | Screen background — neutral light grey behind all cards |
| Surface | `#FFFFFF` | Card surfaces, dialogs, bottom sheets |
| Error | `#EF4444` | Reset App Data button, required field asterisks |
| On Primary | `#FFFFFF` | Text/icons on teal buttons |
| On Background | `#111827` | Body text, labels, and icons on the background colour |
| On Surface | `#374151` | Secondary text on cards |

### 7.2 Dark Mode Colour Palette

Dark Mode is activated via the Settings Screen and respects the system-level dark mode preference. Surface colours shift to deep navy and charcoal tones while maintaining the same primary accent colours at slightly higher brightness for sufficient contrast.

| Token | Hex Value | Usage |
|---|---|---|
| Primary | `#1A9B7B` | Same teal remains legible on dark surfaces |
| Primary Variant | `#3B82F6` | Active tab indicators |
| Secondary | `#10B981` | Success states and section accents |
| Background | `#1A1F2E` | Main screen background |
| Surface | `#252B3B` | Card surfaces in Dark Mode |
| Surface Variant | `#2E3549` | Slightly elevated panels |
| Error | `#EF4444` | Reset App Data button, required field asterisks |
| On Primary | `#FFFFFF` | Text on teal elements |
| On Background | `#F9FAFB` | Primary body text on dark background |
| On Surface | `#D1D5DB` | Secondary text on dark cards |

### 7.3 Typography

The app uses the **Roboto** typeface family throughout, consistent with Material Design guidelines and pre-installed on all Android devices.

> Note: The table below references **Inter** — this appears to be the typeface used in the design tool (Figma). Roboto is the target production font.

| Style | Specification & Usage |
|---|---|
| Display Large | Inter, 57sp, Regular — Team discriminator/score on Leaderboard top-three display |
| Headline Large | Inter, 32sp, Bold — Activity names on Activity Overview Screen hero banner |
| Headline Medium | Inter, 28sp, Bold — Section headers on Home Screen (e.g. 'Engineering Challenges') |
| Title Large | Inter, 24sp, Medium — Screen titles in app bars |
| Title Medium | Inter, 20sp, Medium — Card titles (activity names on Home Screen cards) |
| Body Large | Inter, 16sp, Regular — Primary body text for instructions, descriptions, and reflections |
| Body Medium | Inter, 14sp, Regular — Secondary body text, metadata, and labels |
| Label Large | Inter, 14sp, Medium — Button text, tab labels, and chip text |
| Label Small | Inter, 11sp, Medium — Curriculum code chips and micro-labels |

> Font sizes are specified in **sp (scale-independent pixels)** on Android, which means they automatically scale when the user increases their system font size in Accessibility settings.

### 7.4 Accessibility Considerations

STEMM Lab is designed to be usable by the broadest possible range of students, including those with vision impairments, colour blindness, or motor difficulties.

#### 7.4.1 Colour Contrast

All text-on-background and text-on-surface combinations in both Light Mode and Dark Mode meet or exceed the **WCAG 2.1 AA** contrast ratio minimum of 4.5:1 for normal text and 3:1 for large text. Verified using the Material Design Colour Tool (`material.io/resources/color`).

#### 7.4.2 Colour-Blind-Friendly Design

STEMM Lab does not rely on colour alone to convey information. All status indicators include both a colour and an icon or text label.

#### 7.4.3 Text Size and Dynamic Type

The Settings Screen provides a Text Size slider with three settings:

- **Normal** – system default
- **Large** – 125% scale
- **Extra Large** – 150% scale

These settings apply a global multiplier to all sp-based font sizes in the app. The app also respects the system-level text size setting on both Android and iOS.

### 7.6 Tools Used for Theme Design

| Tool | Purpose |
|---|---|
| Material Design Colour Tool (`material.io/resources/color`) | Colour palette generation and contrast ratio verification |
| Figma (`figma.com`) | Visual wireframe construction and theme comparison mockups |
| WebAIM Contrast Checker (`webaim.org/resources/contrastchecker`) | WCAG AA/AAA contrast validation |
| Coolors.co | Palette exploration and colour harmony checking |
| Freepik | Design palette, themes, icons, and inspiration |
| UX Pilot | AI-generated design structures |

---

## 8. Tools and Sources Acknowledged

| Tool / Source | Usage |
|---|---|
| Figma (`figma.com`) | Wireframe and prototype design |
| DrawIO (`drawio.com`) | ERD and user flow diagram creation |
| Material Design 3 guidelines (`m3.material.io`) | UI component and theming standards |
| Freepik | Icons, design palettes, and themes |
| ACARA Australian Curriculum (`australiancurriculum.edu.au`) | Curriculum code references |
| Firebase Documentation (`firebase.google.com/docs`) | Cloud database and storage design reference |
| WebAIM WCAG Contrast Checker (`webaim.org`) | Accessibility contrast validation |
| Claude AI | Document build and understanding support |

---

*End of STEMM Lab Phase One Design Report*
