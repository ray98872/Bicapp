/** How a set for this exercise is measured. */
export type Tracking = 'weight' | 'reps' | 'duration';

export type SetType = 'normal' | 'warmup' | 'drop' | 'failure';

export type Units = 'kg' | 'lb';

export interface Exercise {
  id: string;
  name: string;
  category: string;
  equipment: string;
  level: string;
  mechanic: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  /** Relative image paths (free-exercise-db) or absolute URLs for custom exercises. */
  images: string[];
  tracking: Tracking;
  /** Optional curated tutorial video URL. */
  videoUrl?: string;
  isCustom?: boolean;
}

/** A planned set in a template. Weight is stored in kg. */
export interface TemplateSet {
  type: SetType;
  reps?: number;
  weightKg?: number;
  durationSec?: number;
}

export interface TemplateExercise {
  exerciseId: string;
  restSec: number;
  notes?: string;
  sets: TemplateSet[];
}

export interface Template {
  id: string;
  name: string;
  notes?: string;
  folder?: string;
  exercises: TemplateExercise[];
  createdAt: number;
  updatedAt: number;
  builtin?: boolean;
}

/** A set inside a live or finished workout. Weight is stored in kg. */
export interface WorkoutSet {
  id: string;
  type: SetType;
  weightKg?: number;
  reps?: number;
  durationSec?: number;
  rpe?: number;
  done: boolean;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  restSec: number;
  notes?: string;
  sets: WorkoutSet[];
}

export interface Workout {
  id: string;
  name: string;
  templateId?: string;
  startedAt: number;
  endedAt?: number;
  notes?: string;
  exercises: WorkoutExercise[];
}

export interface RestTimer {
  endsAt: number;
  totalSec: number;
}

export interface Settings {
  units: Units;
  defaultRestSec: number;
  haptics: boolean;
  keepAwake: boolean;
}
