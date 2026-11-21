# Bicapp V1 Feature Spec

## Goal

Ship a usable offline-first iOS and Android workout app that lets a user:

- choose a workout template
- understand how to perform each exercise
- log sets quickly with weight and reps
- run a rest timer during the session
- review workout history and per-exercise progress

The core product promise is simple: open the app, pick a workout, know what to do, log it fast, and see progress.

## Primary Users

- Beginners who want structure without gym culture overload
- Existing Strong-style users who want fast logging without subscriptions or clutter

## Product Principles

- Fast logging beats feature depth
- Guidance is built into the workout flow
- Templates should help users get started quickly
- Everything important works offline
- Progress should feel honest, not gamified

## In Scope

- onboarding for units, experience, goal, and equipment
- built-in exercise library
- built-in workout templates
- start, resume, and finish workout sessions
- set logging with weight, reps, optional RPE
- rest timer with haptics
- previous performance display during workouts
- workout history
- basic per-exercise progress
- local-only persistence

## Out of Scope

- accounts and authentication
- cloud sync
- social features
- wearable integrations
- health integrations
- advanced program engines
- AI form analysis

## Success Criteria

- A new user starts a workout within 60 seconds.
- Logging a set takes 1 to 3 taps after entering numbers.
- The core flow works with no network connection.
- A returning user can see what they lifted last time for each exercise.
- A beginner can learn the movement without leaving the app.

## Core User Stories

- As a user, I can pick a built-in workout template and start immediately.
- As a user, I can view the ordered exercises in a workout.
- As a user, I can open exercise guidance from the active session.
- As a user, I can log weight and reps for each set quickly.
- As a user, I can use a rest timer between sets.
- As a user, I can finish a workout and review a summary.
- As a user, I can review past workouts and exercise progress later.

## Main Features

### Onboarding

- Choose units: `lb` or `kg`
- Choose experience level
- Choose goal: fitness, strength, or muscle building
- Choose equipment profile: full gym, dumbbells only, or bodyweight
- Recommend starter templates from the answers

### Home

- Primary CTA to start a workout
- Resume in-progress workout if one exists
- Show recommended templates
- Show recent workouts

### Exercise Library

- Search by name
- Filter by muscle group and equipment
- Exercise details include:
  - demo media
  - short instructions
  - setup and movement cues
  - common mistakes
  - suggested substitutions

### Workout Templates

- Ship with built-in templates first
- Each template includes:
  - exercise order
  - target sets
  - rep range
  - default rest timer
  - estimated duration

### Workout Session

- Start from a template
- Show current exercise and remaining workout structure
- Show completed and planned sets
- Log:
  - weight
  - reps
  - optional RPE
  - warmup or work-set type
- Show previous performance for the current exercise
- Allow adding, editing, and removing sets

### Rest Timer

- Auto-start after completing a set
- Pause, skip, add time, and use haptics on completion
- Keep correct timing if the app briefly backgrounds

### Workout Summary

- Duration
- Total sets
- Completed exercises
- Session notes
- Basic volume summary

### History and Progress

- Workout history list sorted newest first
- Past workout detail view
- Per-exercise history
- Recent best set
- Estimated 1RM
- Simple trend chart

### Settings

- Units
- Default timer
- Haptics on or off

## Recommended Built-In Templates

- Beginner Full Body A
- Beginner Full Body B
- Upper A
- Lower A
- Push
- Pull
- Legs

Keep the initial list small and well-polished.

## Exercise Library V1 Size

Start with 40 to 60 core exercises. Fewer complete entries are better than a large incomplete library.

Priority exercises:

- barbell back squat
- bench press
- deadlift
- overhead press
- barbell row
- lat pulldown
- leg press
- seated cable row
- dumbbell incline press
- dumbbell curl
- tricep pushdown

## Functional Requirements

- All core flows work offline.
- In-progress workouts restore after app restart.
- Session data saves immediately after set completion.
- Exercise guidance is reachable in one tap from the workout screen.
- Previous performance loads fast enough to feel instant.

## Non-Functional Requirements

- Large tap targets suited to one-thumb use
- No blocking loader during set logging
- Support for accessibility font scaling
- Stable local persistence for active workouts
- Calm visual design with minimal clutter

## V1 Acceptance Criteria

- User can complete a workout from a built-in template.
- User can log at least weight and reps for each set.
- User can use a rest timer after each set.
- User can open exercise guidance during an active session.
- User can close and reopen the app without losing the workout.
- User can review workout history and one progress metric per exercise.

## Suggested Release Split

### V1.0

- onboarding
- home
- built-in templates
- exercise library with guidance
- session logging
- rest timer
- history
- basic progress

### V1.1

- custom templates
- duplicate a past workout
- export and import
- larger exercise library

### V1.2

- program progression rules
- deload logic
- backup and sync options
