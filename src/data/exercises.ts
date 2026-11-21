import type { Exercise, Tracking } from '@/lib/types';

import raw from './exercises.json';
import { CURATED_VIDEOS } from './exercise-videos';

type RawExercise = {
  id: string;
  n: string;
  c: string;
  e: string;
  l: string;
  m: string | null;
  p: string[];
  s: string[];
  i: string[];
  img: string[];
  t: Tracking;
};

/** Images are served from the public-domain Free Exercise DB and cached on device by expo-image. */
export const IMAGE_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';

export const BUILTIN_EXERCISES: Exercise[] = (raw as RawExercise[]).map((r) => ({
  id: r.id,
  name: r.n,
  category: r.c,
  equipment: r.e,
  level: r.l,
  mechanic: r.m,
  primaryMuscles: r.p,
  secondaryMuscles: r.s,
  instructions: r.i,
  images: r.img,
  tracking: r.t,
  videoUrl: CURATED_VIDEOS[r.id],
}));

const builtinById = new Map(BUILTIN_EXERCISES.map((e) => [e.id, e]));

export function getBuiltinExercise(id: string) {
  return builtinById.get(id);
}

export function imageUrl(path: string) {
  return /^(https?:|file:|data:)/.test(path) ? path : IMAGE_BASE + path;
}

/** Curated video if one exists, otherwise a YouTube search for a form tutorial. */
export function videoUrl(exercise: Exercise) {
  if (exercise.videoUrl) return exercise.videoUrl;
  const q = encodeURIComponent(`how to do ${exercise.name} exercise proper form`);
  return `https://www.youtube.com/results?search_query=${q}`;
}

export const MUSCLES = [
  'abdominals', 'abductors', 'adductors', 'biceps', 'calves', 'chest', 'forearms', 'glutes',
  'hamstrings', 'lats', 'lower back', 'middle back', 'neck', 'quadriceps', 'shoulders', 'traps',
  'triceps',
];

export const EQUIPMENT = [
  'barbell', 'dumbbell', 'bodyweight', 'cable', 'machine', 'kettlebell', 'band', 'ez bar',
  'medicine ball', 'exercise ball', 'foam roll', 'other',
];

export const CATEGORIES = [
  'strength', 'stretching', 'plyometrics', 'powerlifting', 'olympic weightlifting', 'strongman',
  'cardio',
];

export function titleCase(s: string) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}
