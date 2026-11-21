import type { Workout, WorkoutSet } from './types';

/** Epley estimated one-rep max. */
export function estimate1RM(weightKg?: number, reps?: number) {
  if (!weightKg || !reps) return 0;
  if (reps === 1) return weightKg;
  return weightKg * (1 + reps / 30);
}

export function setVolume(s: WorkoutSet) {
  return s.done && s.type !== 'warmup' ? (s.weightKg ?? 0) * (s.reps ?? 0) : 0;
}

export function workoutVolume(w: Workout) {
  return w.exercises.reduce((sum, e) => sum + e.sets.reduce((a, s) => a + setVolume(s), 0), 0);
}

export function workoutSetCount(w: Workout) {
  return w.exercises.reduce((sum, e) => sum + e.sets.filter((s) => s.done).length, 0);
}

export interface ExerciseSession {
  workoutId: string;
  date: number;
  sets: WorkoutSet[];
  best1RM: number;
  bestSet?: WorkoutSet;
  volume: number;
  maxWeight: number;
  maxReps: number;
}

/** All past sessions of an exercise, newest first. */
export function exerciseSessions(history: Workout[], exerciseId: string): ExerciseSession[] {
  const out: ExerciseSession[] = [];
  for (const w of history) {
    const sets = w.exercises
      .filter((e) => e.exerciseId === exerciseId)
      .flatMap((e) => e.sets.filter((s) => s.done));
    if (!sets.length) continue;
    let best1RM = 0;
    let bestSet: WorkoutSet | undefined;
    let maxWeight = 0;
    let maxReps = 0;
    let volume = 0;
    for (const s of sets) {
      const e = estimate1RM(s.weightKg, s.reps);
      if (e > best1RM) {
        best1RM = e;
        bestSet = s;
      }
      maxWeight = Math.max(maxWeight, s.weightKg ?? 0);
      maxReps = Math.max(maxReps, s.reps ?? 0);
      volume += setVolume(s);
    }
    out.push({ workoutId: w.id, date: w.startedAt, sets, best1RM, bestSet, volume, maxWeight, maxReps });
  }
  return out.sort((a, b) => b.date - a.date);
}

export interface PersonalRecords {
  best1RM: number;
  maxWeight: number;
  maxReps: number;
  maxVolume: number;
  longestSec: number;
}

export function personalRecords(history: Workout[], exerciseId: string): PersonalRecords {
  const r: PersonalRecords = { best1RM: 0, maxWeight: 0, maxReps: 0, maxVolume: 0, longestSec: 0 };
  for (const w of history) {
    for (const e of w.exercises) {
      if (e.exerciseId !== exerciseId) continue;
      let vol = 0;
      for (const s of e.sets) {
        if (!s.done) continue;
        r.best1RM = Math.max(r.best1RM, estimate1RM(s.weightKg, s.reps));
        r.maxWeight = Math.max(r.maxWeight, s.weightKg ?? 0);
        r.maxReps = Math.max(r.maxReps, s.reps ?? 0);
        r.longestSec = Math.max(r.longestSec, s.durationSec ?? 0);
        vol += setVolume(s);
      }
      r.maxVolume = Math.max(r.maxVolume, vol);
    }
  }
  return r;
}

/** PRs set in `workout` compared with everything that came before it. */
export function detectPRs(workout: Workout, previous: Workout[]) {
  const prs: { exerciseId: string; kind: string }[] = [];
  const seen = new Set<string>();
  for (const e of workout.exercises) {
    if (seen.has(e.exerciseId)) continue;
    seen.add(e.exerciseId);
    const before = personalRecords(previous, e.exerciseId);
    const now = personalRecords([workout], e.exerciseId);
    const hadHistory = before.maxWeight > 0 || before.maxReps > 0 || before.longestSec > 0;
    if (!hadHistory) continue;
    if (now.best1RM > before.best1RM + 0.01) prs.push({ exerciseId: e.exerciseId, kind: 'Est. 1RM' });
    if (now.maxWeight > before.maxWeight + 0.01) prs.push({ exerciseId: e.exerciseId, kind: 'Heaviest weight' });
    if (now.maxVolume > before.maxVolume + 0.01) prs.push({ exerciseId: e.exerciseId, kind: 'Best volume' });
    if (now.maxReps > before.maxReps && now.maxWeight === 0) prs.push({ exerciseId: e.exerciseId, kind: 'Most reps' });
    if (now.longestSec > before.longestSec) prs.push({ exerciseId: e.exerciseId, kind: 'Longest hold' });
  }
  return prs;
}
