# STEMM-Labs

A React Native project built with [Expo](https://expo.dev).

## Prerequisites

Before you begin, ensure you have the following installed on your operating system (Windows, macOS, or Linux):

1. **Node.js LTS**: Download and install from [nodejs.org](https://nodejs.org/). This will also install `npm`.
2. **Git**: Download and install from [git-scm.com](https://git-scm.com/).
3. **Expo Go App (Optional but recommended)**: Install the Expo Go app on your physical iOS or Android device to quickly preview the app.

For building and running the app on simulators/emulators, you will need:
- **Android**: Install [Android Studio](https://developer.android.com/studio) and set up an Android Emulator (Available on Windows, macOS, Linux).
- **iOS**: Install Xcode from the Mac App Store and set up an iOS Simulator (macOS only).

## Installation & Setup Step-by-Step

### 1. Clone the Repository
Open your terminal or command prompt and clone the repository:
```bash
git clone <your-repository-url>
cd stemm-labs
```

### 2. Install Dependencies
Run the following command to install all required packages:
```bash
npm install
```

### 3. Firebase Configuration (If Applicable)
This project uses Firebase. Ensure you have the proper Firebase environment variables or config files (`google-services.json` for Android, `GoogleService-Info.plist` for iOS) placed in the project root if you are building native apps, or the correct configuration initialized in your Firebase setup files.

## Running the Project

### Start the Expo Development Server
This is the primary way to run the app during development:
```bash
npx expo start
```
This command starts a local development server and provides a QR code in your terminal. 

### Viewing the App
Choose one of the following methods to view the app while the server is running:

- **On a Physical Device**: Open the **Expo Go** app on your phone and scan the QR code from the terminal (use the standard Camera app on iOS, or the scan button inside Expo Go on Android). Make sure your phone and laptop are on the same Wi-Fi network.
- **On Android Emulator**: Press `a` in the terminal to open the app on a running Android emulator.
- **On iOS Simulator (macOS only)**: Press `i` in the terminal to open the app in an iOS simulator.
- **On Web Browser**: Press `w` in the terminal to open the web version of the app.

## Additional Commands

- **Clear Metro Bundler Cache**: If you run into weird caching issues, start the server and clear the cache:
  ```bash
  npx expo start -c
  ```
- **Run Linting**:
  ```bash
  npm run lint
  ```

## Troubleshooting

- **"Command not found: npm"**: Ensure Node.js is correctly installed and added to your system's PATH.
- **Metro bundler failing to connect to Expo Go**: Ensure your firewall isn't blocking the port (usually 8081) and that both your computer and mobile device are connected to the exact same Wi-Fi network.