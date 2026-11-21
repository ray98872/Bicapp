import type { Template, TemplateExercise, TemplateSet } from '@/lib/types';

/** n working sets of `reps` reps (or seconds for duration exercises). */
function sets(n: number, reps: number, warmups = 0): TemplateSet[] {
  return [
    ...Array.from({ length: warmups }, () => ({ type: 'warmup' as const, reps: 8 })),
    ...Array.from({ length: n }, () => ({ type: 'normal' as const, reps })),
  ];
}

function timed(n: number, seconds: number): TemplateSet[] {
  return Array.from({ length: n }, () => ({ type: 'normal' as const, durationSec: seconds }));
}

function ex(exerciseId: string, s: TemplateSet[], restSec = 90, notes?: string): TemplateExercise {
  return { exerciseId, sets: s, restSec, notes };
}

type Def = Omit<Template, 'createdAt' | 'updatedAt' | 'builtin'>;

const defs: Def[] = [
  {
    id: 'builtin-fullbody-a',
    name: 'Beginner Full Body A',
    folder: 'Beginner',
    notes: 'Alternate A and B, three days a week. Add a little weight when you hit every rep.',
    exercises: [
      ex('Barbell_Squat', sets(3, 8, 1), 120),
      ex('Barbell_Bench_Press_-_Medium_Grip', sets(3, 8, 1), 120),
      ex('Seated_Cable_Rows', sets(3, 10), 90),
      ex('Romanian_Deadlift', sets(2, 10), 90),
      ex('Plank', timed(3, 30), 60),
    ],
  },
  {
    id: 'builtin-fullbody-b',
    name: 'Beginner Full Body B',
    folder: 'Beginner',
    notes: 'Alternate A and B, three days a week.',
    exercises: [
      ex('Leg_Press', sets(3, 10, 1), 120),
      ex('Dumbbell_Shoulder_Press', sets(3, 10), 90),
      ex('Wide-Grip_Lat_Pulldown', sets(3, 10), 90),
      ex('Dumbbell_Lunges', sets(2, 10), 90),
      ex('Dumbbell_Bicep_Curl', sets(2, 12), 60),
      ex('Triceps_Pushdown', sets(2, 12), 60),
    ],
  },
  {
    id: 'builtin-5x5-a',
    name: '5x5 Workout A',
    folder: 'Strength',
    notes: 'Classic 5x5. Alternate A/B. Add 2.5 kg / 5 lb each session you complete all reps.',
    exercises: [
      ex('Barbell_Squat', sets(5, 5, 2), 180),
      ex('Barbell_Bench_Press_-_Medium_Grip', sets(5, 5, 1), 180),
      ex('Bent_Over_Barbell_Row', sets(5, 5, 1), 180),
    ],
  },
  {
    id: 'builtin-5x5-b',
    name: '5x5 Workout B',
    folder: 'Strength',
    notes: 'Classic 5x5. Deadlift is a single heavy set of 5.',
    exercises: [
      ex('Barbell_Squat', sets(5, 5, 2), 180),
      ex('Standing_Military_Press', sets(5, 5, 1), 180),
      ex('Barbell_Deadlift', sets(1, 5, 2), 180),
    ],
  },
  {
    id: 'builtin-push',
    name: 'Push',
    folder: 'Push / Pull / Legs',
    exercises: [
      ex('Barbell_Bench_Press_-_Medium_Grip', sets(4, 8, 1), 150),
      ex('Incline_Dumbbell_Press', sets(3, 10), 90),
      ex('Dumbbell_Shoulder_Press', sets(3, 10), 90),
      ex('Side_Lateral_Raise', sets(3, 15), 60),
      ex('Triceps_Pushdown_-_Rope_Attachment', sets(3, 12), 60),
      ex('Cable_Rope_Overhead_Triceps_Extension', sets(2, 12), 60),
    ],
  },
  {
    id: 'builtin-pull',
    name: 'Pull',
    folder: 'Push / Pull / Legs',
    exercises: [
      ex('Barbell_Deadlift', sets(3, 5, 1), 180),
      ex('Pullups', sets(3, 8), 120),
      ex('Seated_Cable_Rows', sets(3, 10), 90),
      ex('Face_Pull', sets(3, 15), 60),
      ex('Barbell_Curl', sets(3, 10), 60),
      ex('Hammer_Curls', sets(2, 12), 60),
    ],
  },
  {
    id: 'builtin-legs',
    name: 'Legs',
    folder: 'Push / Pull / Legs',
    exercises: [
      ex('Barbell_Squat', sets(4, 6, 2), 180),
      ex('Romanian_Deadlift', sets(3, 10), 120),
      ex('Leg_Press', sets(3, 12), 90),
      ex('Lying_Leg_Curls', sets(3, 12), 60),
      ex('Leg_Extensions', sets(3, 12), 60),
      ex('Standing_Calf_Raises', sets(4, 15), 60),
    ],
  },
  {
    id: 'builtin-upper',
    name: 'Upper',
    folder: 'Upper / Lower',
    exercises: [
      ex('Barbell_Bench_Press_-_Medium_Grip', sets(4, 6, 1), 150),
      ex('Bent_Over_Barbell_Row', sets(4, 8), 120),
      ex('Dumbbell_Shoulder_Press', sets(3, 10), 90),
      ex('Wide-Grip_Lat_Pulldown', sets(3, 10), 90),
      ex('Dumbbell_Bicep_Curl', sets(2, 12), 60),
      ex('Triceps_Pushdown', sets(2, 12), 60),
    ],
  },
  {
    id: 'builtin-lower',
    name: 'Lower',
    folder: 'Upper / Lower',
    exercises: [
      ex('Barbell_Squat', sets(4, 6, 2), 180),
      ex('Romanian_Deadlift', sets(3, 8), 120),
      ex('Dumbbell_Lunges', sets(3, 10), 90),
      ex('Seated_Leg_Curl', sets(3, 12), 60),
      ex('Seated_Calf_Raise', sets(4, 15), 60),
      ex('Hanging_Leg_Raise', sets(3, 10), 60),
    ],
  },
  {
    id: 'builtin-dumbbell-only',
    name: 'Dumbbell Only Full Body',
    folder: 'Home & Minimal',
    notes: 'Everything you need with a pair of dumbbells and a bench.',
    exercises: [
      ex('Goblet_Squat', sets(3, 10), 90),
      ex('Dumbbell_Bench_Press', sets(3, 10), 90),
      ex('One-Arm_Dumbbell_Row', sets(3, 10), 90),
      ex('Dumbbell_Shoulder_Press', sets(3, 10), 90),
      ex('Split_Squat_with_Dumbbells', sets(2, 10), 60),
      ex('Hammer_Curls', sets(2, 12), 60),
    ],
  },
  {
    id: 'builtin-bodyweight',
    name: 'Bodyweight at Home',
    folder: 'Home & Minimal',
    notes: 'No equipment. Do it as a circuit for extra conditioning.',
    exercises: [
      ex('Bodyweight_Squat', sets(3, 15), 60),
      ex('Pushups', sets(3, 10), 60),
      ex('Bodyweight_Walking_Lunge', sets(3, 12), 60),
      ex('Single_Leg_Glute_Bridge', sets(3, 12), 45),
      ex('Mountain_Climbers', timed(3, 30), 45),
      ex('Plank', timed(3, 30), 45),
    ],
  },
  {
    id: 'builtin-core',
    name: 'Core Finisher',
    folder: 'Home & Minimal',
    exercises: [
      ex('Plank', timed(3, 45), 45),
      ex('Hanging_Leg_Raise', sets(3, 10), 60),
      ex('Russian_Twist', sets(3, 20), 45),
      ex('Cable_Crunch', sets(3, 15), 45),
      ex('Dead_Bug', sets(3, 10), 45),
    ],
  },
];

export const BUILTIN_TEMPLATES: Template[] = defs.map((d) => ({
  ...d,
  builtin: true,
  createdAt: 0,
  updatedAt: 0,
}));
