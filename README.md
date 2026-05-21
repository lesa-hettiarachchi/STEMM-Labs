# 🔬 STEMM Labs

A cross-platform mobile app that turns real-world physical experiments into game-based STEMM (Science, Technology, Engineering, Mathematics, Medicine) learning activities for upper-primary and lower-secondary students.

Built with **React Native + Expo (SDK 54)**, **TypeScript**, **Firebase**, and **SQLite**. Ships as a signed Android APK via **EAS Build**.

---

## 📥 Download

| Platform | Status | Link |
|---|---|---|
| **Android - sideload APK** | Available now | [Latest EAS build](https://expo.dev/accounts/lesa-hettiarachchi/projects/STEMM-Labs/builds/5f6d2973-1079-4fd8-ac84-61d18c83b494) |
| **Google Play Store** | Coming soon | [play.google.com/store/apps/details?id=com.stemmlabs.app](https://play.google.com/store/apps/details?id=com.stemmlabs.app) *(live after Play Console review)* |
| **Apple App Store** | Coming soon | `apps.apple.com/app/stemm-labs` *(live after App Store review)* |

> Open the EAS link above on an Android phone, tap **Install**, then allow "Install from unknown sources" if prompted. The Play Store and App Store links are reserved with the bundle identifier `com.stemmlabs.app` and will go live once the app passes review.

---

## 🎯 What's inside

**7 sensor-driven activities** grouped into two categories:

| Engineering | Health & Medical |
|---|---|
| Parachute Drop Challenge - drop time / drag / g-force | Human Performance Lab - smoothness scoring |
| Sound Pollution Hunter - live dB meter + GPS zone map | Reaction Board Challenge - 3-phase reflex test |
| Hand Fan Challenge - accelerometer bend angle + force calc | Breathing Pace Trainer - chest-movement breaths/min |
| Earthquake-Resistant Structure - vibration amplitude | |

Each activity captures real device-sensor data, applies physics formulas, and writes results to a team leaderboard.

**Device capabilities used:** accelerometer, microphone, camera, GPS, battery, push notifications, background tasks (Work Manager equivalent), AdMob banner, local SQLite, Firestore, Firebase Authentication, Firebase Storage.

---

## 🛠️ Tech stack

- **Frontend**: Expo Router v6, React Native 0.81, TypeScript, React 19.1
- **Cloud**: Firebase (Email/Password Auth, Firestore, Storage)
- **Local**: SQLite (`expo-sqlite`), AsyncStorage
- **Sensors**: `expo-sensors`, `expo-audio`, `expo-location`, `expo-battery`
- **Background work**: `expo-task-manager` + `expo-background-fetch`
- **Maps**: `react-native-maps` with native Google Maps SDK
- **Ads**: `react-native-google-mobile-ads` (test ad unit IDs)
- **Testing**: Jest + jest-expo + React Native Testing Library (72 tests across unit, integration, and component-level e2e)
- **Build**: EAS Build (managed Android keystore)

---

## 📋 Prerequisites

1. **Node.js LTS** - install from [nodejs.org](https://nodejs.org)
2. **Git** - install from [git-scm.com](https://git-scm.com)
3. **An Expo account** (free) - sign up at [expo.dev/signup](https://expo.dev/signup) if you plan to build an APK
4. **A Firebase project** - see the *Firebase setup* section below

For development:
- **Android**: Android Studio + an emulator, OR a physical Android phone + Expo Go (for partial preview)
- **iOS**: Xcode + Simulator (macOS only)

---

## 🚀 Quick start

```bash
# 1. Clone the repository
git clone <your-repository-url>
cd STEMM-Labs

# 2. Install dependencies (legacy peer deps required for jest/react alignment)
npm install --legacy-peer-deps

# 3. Configure your Firebase credentials (see next section)
cp .env.example .env
# … then edit .env and paste your real Firebase values

# 4. Start Metro
npx expo start --clear
```

Press **a** to launch on an Android emulator, **i** for iOS Simulator, or scan the QR code with Expo Go on a physical device.

---

## 🔥 Firebase setup

The app requires a Firebase project with three services enabled.

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and click **Add project**.
2. After the project is created, click **`</>` (Add Web app)** and copy the 6 `firebaseConfig` values it gives you.
3. Paste those values into your local `.env` file (see `.env.example` for the keys):
   ```
   EXPO_PUBLIC_FIREBASE_API_KEY=…
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=…
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=…
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=…
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=…
   EXPO_PUBLIC_FIREBASE_APP_ID=…
   ```
4. In the Firebase Console, enable the three services the app uses:
   - **Build → Authentication → Sign-in method → Email/Password → Enable**
   - **Build → Firestore Database → Create database → Test mode**
   - **Build → Storage → Get started → Test mode**

For Maps to work in an installed APK you also need a **Google Maps Android API key** — create one in [Google Cloud Console](https://console.cloud.google.com) → Credentials → API Keys, enable *Maps SDK for Android*, and paste it into `.env` as `GOOGLE_MAPS_ANDROID_API_KEY`.

**No credentials are hard-coded in source.** All keys load from `.env` (gitignored) for local dev and from EAS Environment Variables for cloud builds.

---

## ⚙️ Available scripts

| Command | Purpose |
|---|---|
| `npm start` | Start the Expo dev server |
| `npm run android` | Run on a connected Android emulator/device |
| `npm run ios` | Run on the iOS Simulator (macOS only) |
| `npm test` | Run all 72 Jest tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Run ESLint |

---

## 📦 Building an APK

```bash
# One-time setup
npm install -g eas-cli
eas login
# registers this project to your Expo account
eas init

# Build (10–20 min in the cloud, fully managed)
eas build --platform android --profile preview
```

The `preview` profile produces an installable `.apk`. EAS prints a download link when the build finishes.

The `production` profile (`--profile production`) produces a Play Store `.aab` instead.

Environment variables for cloud builds are stored in EAS itself — push them once with:
```bash
eas env:create --environment preview --name EXPO_PUBLIC_FIREBASE_API_KEY --value "…" --visibility sensitive
# … repeat for each EXPO_PUBLIC_* var and GOOGLE_MAPS_ANDROID_API_KEY
```

---

## 📁 Project structure

```
STEMM-Labs/
├── app/                    # Screens (expo-router file-based routing)
│   ├── (tabs)/             # Bottom-tab navigator: Home, Leaderboard, Map, Profile
│   ├── activity/[id]/      # Dynamic activity routes: overview, instructions, record, results, camera
│   ├── login.tsx           # Email/password sign-in
│   ├── signup.tsx          # Create new team account
│   ├── register.tsx        # Team profile setup (after first sign-in)
│   ├── settings.tsx        # Theme, text size, logout, danger zone
│   └── help.tsx            # Per-activity curriculum + formula reference
├── components/
│   ├── activity/           # Custom data tables (Parachute, HandFan, Earthquake, generic Editable)
│   ├── sensors/            # AccelSensor, SoundSensor, ReactionSensor
│   ├── AdBanner.tsx        # AdMob banner with graceful Expo-Go fallback
│   └── ThemedText.tsx
├── context/                # AuthContext, TeamContext, ActivityContext, SettingsContext
├── services/               # firebase.ts, firestore.ts, database.ts (SQLite),
│                           # storage.ts (AsyncStorage), location.ts, notifications.ts,
│                           # backgroundTask.ts, calculations.ts, sensors/*.ts
├── hooks/                  # useBattery, useThemeColor, etc.
├── constants/              # theme, types, activities (master activity definitions)
├── __tests__/              # 72 Jest tests across 6 files
├── __mocks__/              # Jest mocks for native modules
└── app.config.js           # Dynamic Expo config (reads env vars)
```

---

## 🧪 Testing

72 tests across 6 files, covering unit, integration, and component-level e2e:

| File | Type | Person |
|---|---|---|
| `calculations.unit.test.ts` | Unit (14 tests) | Person 1 |
| `activityCalculations.integration.test.ts` | Integration (16 tests) | Person 1 |
| `homeScreen.e2e.test.tsx` | E2E component (7 tests) | Person 1 |
| `storage.unit.test.ts` | Unit (10 tests) | Person 2 |
| `notificationService.integration.test.ts` | Integration (10 tests) | Person 2 |
| `profileScreen.e2e.test.tsx` | E2E component (9 tests) | Person 2 |

Run with:
```bash
npm test
```

The app has also been validated on **Firebase Test Lab** Robo crawler across multiple Android device profiles.

## 🆘 Troubleshooting

| Problem | Fix |
|---|---|
| `npm install` fails with peer-dep error | Use `npm install --legacy-peer-deps` (matched in `.npmrc`) |
| Metro shows "Firebase config missing" | Copy `.env.example` to `.env` and fill in your Firebase values |
| Map tab shows blank grey screen in APK | Add `GOOGLE_MAPS_ANDROID_API_KEY` to `.env` AND push to EAS env, then rebuild |
| `expo-notifications` warnings in Expo Go | Expected — push notifications need a development build, not Expo Go |
| dB meter reads consistently high | Adjust `DBFS_OFFSET` in `services/sensors/audio.ts` (default 90) |
| EAS build fails with `npm ci` mismatch | Delete `package-lock.json`, run `npm install --legacy-peer-deps`, commit, retry |

---

## 📄 License

This project was built as a team submission for **CSE3MAD Mobile Application Development** at La Trobe University. The code, design system, activity definitions, and reports are coursework.

Activity content (formulas, curriculum links, discussion text) is adapted from the *2026 STEMM Lab User Specification*.
