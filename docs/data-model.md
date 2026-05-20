# Data Model (draft)

Minimal v1 schema. Designed to round-trip cleanly to JSON for export/backup.

## Entities

### `exercises`
The master list of movements (push-up, barbell squat, etc.). Shipped with the app, user can add custom ones.

| field | type | notes |
|---|---|---|
| id | text (uuid) | PK |
| name | text | display name |
| primary_muscle | text | enum-ish |
| equipment | text | barbell / dumbbell / bodyweight / machine / cable |
| demo_url | text? | local asset path or remote URL |
| is_custom | boolean | user-created flag |
| created_at | int (epoch ms) | |

### `programs`
Built-in or user-defined routines.

| field | type | notes |
|---|---|---|
| id | text (uuid) | PK |
| name | text | e.g. "StrongLifts 5x5" |
| description | text | |
| schedule_json | text | serialized week template |
| is_builtin | boolean | |

### `workouts`
A single training session.

| field | type | notes |
|---|---|---|
| id | text (uuid) | PK |
| program_id | text? | FK → programs |
| name | text | e.g. "Push Day A" |
| started_at | int (epoch ms) | |
| ended_at | int? (epoch ms) | null while in progress |
| notes | text? | |

### `sets`
Individual logged sets.

| field | type | notes |
|---|---|---|
| id | text (uuid) | PK |
| workout_id | text | FK → workouts |
| exercise_id | text | FK → exercises |
| set_index | int | 1, 2, 3… within the exercise within the workout |
| weight | real | kg or lb based on user pref |
| reps | int | |
| rpe | real? | optional 1–10 |
| is_warmup | boolean | |
| completed_at | int (epoch ms) | |

### `user_prefs` (single row)

| field | type | notes |
|---|---|---|
| units | text | "kg" or "lb" |
| rest_timer_default_s | int | default rest seconds |
| haptics_enabled | boolean | |
| theme | text | "system" / "light" / "dark" |

## Indexes

- `sets(workout_id)`
- `sets(exercise_id, completed_at)` — fast per-exercise history
- `workouts(started_at DESC)` — history list

## Notes

- All IDs are UUIDs (string) so we can sync later without ID collisions.
- All timestamps are epoch ms; format only at the render layer.
- 1RM estimates and PRs are *derived*, not stored, so the source-of-truth stays small.
