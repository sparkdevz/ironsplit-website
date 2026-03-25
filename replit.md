# Split-4 — 4-Day Upper/Lower Workout Tracker (Mobile App)

## Overview
A React Native (Expo) mobile app converted from an HTML workout tracker. Features a 4-day upper/lower split workout plan with full exercise tracking, history comparison, exercise variation swapping, dark/light mode, and Google AdMob banner ads.

## Architecture
- **Framework**: Expo 55 with Expo Router (file-based routing)
- **Platform**: React Native — runs on iOS/Android via Expo Go; web bundling fails (AdMob native-only, expected)
- **State**: React Context + AsyncStorage for persistent data
- **Navigation**: Expo Router stack navigation

## Key Features
- Weekly schedule overview (Week 1–12 selector)
- 4 workout days: Push (Mon), Quad (Tue), Pull (Thu), Hinge (Fri)
- Per-exercise set tracking (weight + reps)
- Previous week comparison with arrows (▲▼)
- Exercise variation swap system (3 alternatives per exercise)
- kg/lbs unit toggle (default: lbs)
- Dark / light mode toggle (persisted in AsyncStorage, default: dark)
- Exercise demonstration images via wger.de static URL map
- Google AdMob banner ads (test IDs in dev, replace with real IDs for production)

## Project Structure
```
app/
  _layout.tsx              - Root layout with WorkoutProvider, no global StatusBar
  index.tsx                - Home screen (week overview, workout cards, schedule)
  workout/
    [day].tsx              - Day workout screen (exercises, tracking, variations)

constants/
  workoutData.ts           - All exercise data (4 days × 6 exercises × 3 variations)
  exerciseImages.ts        - Static map of exercise name → wger.de image URL
  theme.ts                 - Dark/Light ThemeColors definitions + getTheme()

context/
  WorkoutContext.tsx       - Week, unit, colorScheme, session data, swap state

components/
  AdBanner.tsx             - Google AdMob banner with Expo Go/web graceful fallback

hooks/
  useExerciseImage.ts      - Helper to resolve exercise image URI from static map
```

## Running
- Workflow: "Start Frontend" runs `npx expo start --port 5000 --tunnel`
- Scan QR code in Expo Go for native mobile testing
- Web preview shows web bundling error (AdMob is native-only — this is expected)

## Data Persistence (AsyncStorage keys)
- `wl_{day}_{exIndex}_w{week}` — set tracking data
- `wl_swap_{day}_{exIndex}` — exercise variation swaps
- `wl_unit` — kg or lbs preference
- `wl_week` — current week (1–12)
- `wl_scheme` — color scheme: "dark" or "light"

## AdMob Setup (production)
- Replace Android/iOS app IDs in `app.json` under `react-native-google-mobile-ads` plugin
- Replace `ANDROID_AD_UNIT_ID` / `IOS_AD_UNIT_ID` in `components/AdBanner.tsx`
- Requires EAS Build (development build), not Expo Go
- Test IDs: Android app `ca-app-pub-3940256099942544~3347511713`, iOS app `ca-app-pub-3940256099942544~1458002511`

## Theme System
- `constants/theme.ts` defines `DARK` and `LIGHT` color palettes (`ThemeColors` interface)
- `WorkoutContext` exposes `colorScheme`, `toggleColorScheme`, and `theme` (computed ThemeColors)
- Home screen has ☀️/🌙 toggle button in the header; both screens use `theme.*` for all colors
- StatusBar style switches automatically with the theme
