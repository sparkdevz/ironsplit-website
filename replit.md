# 4-Day Upper/Lower Workout Tracker — Mobile App

## Overview
A React Native (Expo) mobile app converted from an HTML workout tracker. Features a 4-day upper/lower split workout plan with full exercise tracking, history comparison, and exercise variation swapping.

## Architecture
- **Framework**: Expo 55 with Expo Router (file-based routing)
- **Platform**: React Native Web (runs in browser, deployable as mobile app via Expo Go)
- **State**: React Context + AsyncStorage for persistent data
- **Navigation**: Expo Router stack navigation

## Key Features
- Weekly schedule overview (Week 1–12 selector)
- 4 workout days: Push (Mon), Quad (Tue), Pull (Thu), Hinge (Fri)
- Per-exercise set tracking (weight + reps)
- Previous week comparison with arrows (▲▼)
- Exercise variation swap system (3 alternatives per exercise)
- kg/lbs unit toggle
- Dark theme

## Project Structure
```
app/
  _layout.tsx         - Root layout with WorkoutProvider
  index.tsx           - Home screen (week overview + schedule)
  workout/
    [day].tsx         - Day workout screen (exercises, tracking, variations)

constants/
  workoutData.ts      - All exercise data (4 days × 6 exercises × 3 variations)

context/
  WorkoutContext.tsx  - Week, unit, session data, swap state via AsyncStorage
```

## Running
- Workflow: "Start Frontend" runs `npx expo start --port 5000 --web`
- Port: 5000 (web preview)
- Users can also scan QR code in Expo Go for native mobile testing

## Data Persistence
- AsyncStorage keys: `wl_{day}_{exIndex}_w{week}` for set data
- AsyncStorage keys: `wl_swap_{day}_{exIndex}` for exercise swaps
- Unit and week preference saved in AsyncStorage
