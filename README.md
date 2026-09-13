# Mensola — Mobile App

The React Native mobile application for Mensola, built with Expo SDK 57. Supports Android and iOS via a single codebase with file-based routing through Expo Router.

---

## Prerequisites

- **Node.js** 20+
- **Expo CLI** — `npm install -g expo-cli` (or use `npx expo` directly)
- **Android Studio** (for Android emulator) or **Xcode** (for iOS simulator, macOS only)
- A running instance of the [Mensola API](../api/README.md)

For physical device development, install the [Expo Go](https://expo.dev/go) app or a custom development build (see [EAS Builds](#eas-builds) below).

---

## Getting Started

```bash
cd mobile

# Install dependencies
npm install

# Copy and configure the environment file
cp .env.example .env
# Set EXPO_PUBLIC_API_URL to your local API address (see below)

# Start the Expo development server
npm start
```

This opens the Expo dev tools in your terminal. From there you can:

- Press `a` to open on an Android emulator
- Press `i` to open on an iOS simulator (macOS only)
- Scan the QR code with the Expo Go app on a physical device

### Running on a Specific Platform

```bash
# Android emulator / device
npm run android

# iOS simulator (macOS only)
npm run ios
```

---

## Environment Variables

Create a `.env` file in the `mobile/` directory:

```env
# The base URL of the Mensola API
EXPO_PUBLIC_API_URL=http://localhost:3457
```

> **Note:** When running on a physical device, `localhost` won't work. Use your machine's local network IP address instead (e.g. `http://192.168.1.x:3457`). For production builds, the URL is set automatically by EAS to `https://api.mensola.app`.

---

## Available Scripts

| Script | Description |
|---|---|
| `npm start` | Start the Expo dev server |
| `npm run android` | Start and open on Android |
| `npm run ios` | Start and open on iOS |
| `npm run web` | Start in web mode |
| `npm run lint` | Run ESLint |
| `npm test` | Run the Jest test suite |

---

## Running Tests

Tests use Jest with the `jest-expo` preset and `@testing-library/react-native`.

```bash
npm test
```

Test files live in the `__tests__/` directory at the project root.

---

## EAS Builds

The app uses [EAS Build](https://docs.expo.dev/build/introduction/) for generating native binaries. Three build profiles are configured:

| Profile | Distribution | Android Output | Notes |
|---|---|---|---|
| `development` | Internal | APK | Includes dev client for debugging |
| `preview` | Internal | APK | Staging / QA builds |
| `production` | Store | AAB | Points to `https://api.mensola.app` |

### Running a Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Log in to your Expo account
eas login

# Build for Android (development profile)
eas build --platform android --profile development

# Build for iOS (development profile)
eas build --platform ios --profile development

# Production build
eas build --platform all --profile production
```

### OTA Updates

The app is configured for [Expo Updates](https://docs.expo.dev/eas-update/introduction/) with the `appVersion` runtime policy. OTA updates are channel-scoped:

- `development` channel → development builds
- `preview` channel → preview builds
- `production` channel → production builds

```bash
# Push an OTA update to the production channel
eas update --channel production --message "Fix: home feed crash"
```

---

## Project Structure

```
mobile/
├── app/                → Expo Router screens (file-based routing)
│   ├── (auth)/         → Authentication screens (login, register)
│   ├── (tabs)/         → Main tab navigator screens
│   └── _layout.tsx     → Root layout
├── components/         → Reusable UI components
├── constants/          → App-wide constants (colours, sizes, etc.)
├── context/            → React context providers
├── hooks/              → Custom hooks
├── i18n/               → Internationalisation configuration
├── locales/            → Translation files (JSON)
├── services/           → API service layer (TanStack Query hooks)
├── types/              → Shared TypeScript types
├── utils/              → Helper functions
├── assets/             → Images, fonts, icons
├── __tests__/          → Jest test files
├── app.json            → Expo app configuration
├── eas.json            → EAS Build profiles
└── package.json
```

---

## Key Dependencies

| Package | Purpose |
|---|---|
| `expo-router` | File-based navigation |
| `@tanstack/react-query` | Server state management and data fetching |
| `zustand` | Lightweight client-side state management |
| `expo-secure-store` | Secure storage for auth tokens |
| `react-native-mmkv` | High-performance key-value storage |
| `i18next` + `react-i18next` | Internationalisation |
| `expo-notifications` | Push notification handling |
| `expo-image` | Optimised image component |
| `expo-image-picker` | Profile photo selection |
| `@react-native-google-signin/google-signin` | Google OAuth sign-in |

---

## Deep Linking

The app handles deep links from `mensola.app` for the following paths:

| Path prefix | Opens |
|---|---|
| `/users/*` | User profile screen |
| `/movie-lists/*` | Movie list detail screen |
| `/playlists/*` | Playlist detail screen |

Deep link scheme: `mensola://`

---

## Internationalisation

Translation files are located in `locales/`. The app uses `expo-localization` to detect the device locale and falls back to English if a translation is unavailable.

To add a new language, create a new JSON file under `locales/` and register it in `i18n/`.

---

## Troubleshooting

**Metro bundler cache issues**
```bash
npm start -- --clear
```

**Android build fails after updating dependencies**
```bash
cd android && ./gradlew clean && cd ..
npm run android
```

**iOS pod issues (macOS)**
```bash
cd ios && pod install && cd ..
npm run ios
```
