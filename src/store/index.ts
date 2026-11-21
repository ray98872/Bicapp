import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMemo } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { BUILTIN_TEMPLATES } from '@/data/builtin-templates';
import { BUILTIN_EXERCISES, getBuiltinExercise } from '@/data/exercises';
import { uid } from '@/lib/format';
import type {
  Exercise,
  RestTimer,
  Settings,
  Template,
  Workout,
  WorkoutExercise,
  WorkoutSet,
} from '@/lib/types';

interface State {
  settings: Settings;
  customExercises: Exercise[];
  templates: Template[];
  history: Workout[];
  active: Workout | null;
  rest: RestTimer | null;

  setSettings: (patch: Partial<Settings>) => void;

  saveCustomExercise: (e: Exercise) => void;
  deleteCustomExercise: (id: string) => void;

  saveTemplate: (t: Template) => void;
  deleteTemplate: (id: string) => void;
  duplicateTemplate: (id: string) => string | undefined;

  startWorkout: (template?: Template) => void;
  repeatWorkout: (w: Workout) => void;
  discardWorkout: () => void;
  finishWorkout: () => Workout | undefined;
  renameWorkout: (name: string) => void;
  setWorkoutNotes: (notes: string) => void;
  addExercises: (exerciseIds: string[]) => void;
  replaceExercise: (instanceId: string, exerciseId: string) => void;
  removeExercise: (instanceId: string) => void;
  moveExercise: (instanceId: string, dir: -1 | 1) => void;
  setExerciseField: (instanceId: string, patch: Partial<Pick<WorkoutExercise, 'notes' | 'restSec'>>) => void;
  addSet: (instanceId: string) => void;
  removeSet: (instanceId: string, setId: string) => void;
  updateSet: (instanceId: string, setId: string, patch: Partial<WorkoutSet>) => void;
  toggleSetDone: (instanceId: string, setId: string) => void;

  startRest: (sec: number) => void;
  adjustRest: (deltaSec: number) => void;
  stopRest: () => void;

  deleteWorkout: (id: string) => void;
  updateHistoryWorkout: (w: Workout) => void;
  importData: (data: Partial<Pick<State, 'settings' | 'customExercises' | 'templates' | 'history'>>) => void;
  resetAll: () => void;
}

const DEFAULT_SETTINGS: Settings = {
  units: 'kg',
  defaultRestSec: 90,
  haptics: true,
  keepAwake: true,
};

/** Most recent completed sets for an exercise, used to pre-fill new sets. */
function lastSets(history: Workout[], exerciseId: string): WorkoutSet[] {
  for (const w of history) {
    const sets = w.exercises
      .filter((e) => e.exerciseId === exerciseId)
      .flatMap((e) => e.sets.filter((s) => s.done));
    if (sets.length) return sets;
  }
  return [];
}

function newSet(prev?: Partial<WorkoutSet>): WorkoutSet {
  return {
    id: uid(),
    type: prev?.type ?? 'normal',
    weightKg: prev?.weightKg,
    reps: prev?.reps,
    durationSec: prev?.durationSec,
    done: false,
  };
}

function updateActive(state: State, fn: (w: Workout) => Workout): Partial<State> {
  return state.active ? { active: fn(state.active) } : {};
}

function mapExercise(w: Workout, instanceId: string, fn: (e: WorkoutExercise) => WorkoutExercise): Workout {
  return { ...w, exercises: w.exercises.map((e) => (e.id === instanceId ? fn(e) : e)) };
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      customExercises: [],
      templates: [],
      history: [],
      active: null,
      rest: null,

      setSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),

      saveCustomExercise: (e) =>
        set((s) => ({
          customExercises: s.customExercises.some((x) => x.id === e.id)
            ? s.customExercises.map((x) => (x.id === e.id ? e : x))
            : [...s.customExercises, { ...e, isCustom: true }],
        })),
      deleteCustomExercise: (id) =>
        set((s) => ({ customExercises: s.customExercises.filter((x) => x.id !== id) })),

      saveTemplate: (t) =>
        set((s) => {
          const now = Date.now();
          const exists = s.templates.some((x) => x.id === t.id);
          const next = { ...t, builtin: false, updatedAt: now, createdAt: exists ? t.createdAt : now };
          return {
            templates: exists ? s.templates.map((x) => (x.id === t.id ? next : x)) : [next, ...s.templates],
          };
        }),
      deleteTemplate: (id) => set((s) => ({ templates: s.templates.filter((t) => t.id !== id) })),
      duplicateTemplate: (id) => {
        const src = [...get().templates, ...BUILTIN_TEMPLATES].find((t) => t.id === id);
        if (!src) return undefined;
        const copy: Template = {
          ...JSON.parse(JSON.stringify(src)),
          id: uid(),
          name: src.builtin ? src.name : `${src.name} (copy)`,
          builtin: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((s) => ({ templates: [copy, ...s.templates] }));
        return copy.id;
      },

      startWorkout: (template) => {
        const { history } = get();
        const exercises: WorkoutExercise[] = (template?.exercises ?? []).map((te) => {
          const prev = lastSets(history, te.exerciseId);
          return {
            id: uid(),
            exerciseId: te.exerciseId,
            restSec: te.restSec,
            notes: te.notes,
            sets: te.sets.map((ts, i) =>
              newSet({
                type: ts.type,
                reps: ts.reps ?? prev[i]?.reps,
                durationSec: ts.durationSec ?? prev[i]?.durationSec,
                weightKg: ts.weightKg ?? prev[i]?.weightKg,
              })
            ),
          };
        });
        set({
          rest: null,
          active: {
            id: uid(),
            name: template?.name ?? timeOfDayName(),
            templateId: template?.id,
            startedAt: Date.now(),
            exercises,
          },
        });
      },
      repeatWorkout: (w) => {
        set({
          rest: null,
          active: {
            id: uid(),
            name: w.name,
            templateId: w.templateId,
            startedAt: Date.now(),
            exercises: w.exercises.map((e) => ({
              ...e,
              id: uid(),
              sets: e.sets.map((s) => newSet(s)),
            })),
          },
        });
      },
      discardWorkout: () => set({ active: null, rest: null }),
      finishWorkout: () => {
        const { active } = get();
        if (!active) return undefined;
        const done: Workout = {
          ...active,
          endedAt: Date.now(),
          exercises: active.exercises
            .map((e) => ({ ...e, sets: e.sets.filter((s) => s.done) }))
            .filter((e) => e.sets.length > 0),
        };
        set((s) => ({ history: [done, ...s.history], active: null, rest: null }));
        return done;
      },
      renameWorkout: (name) => set((s) => updateActive(s, (w) => ({ ...w, name }))),
      setWorkoutNotes: (notes) => set((s) => updateActive(s, (w) => ({ ...w, notes }))),
      addExercises: (ids) =>
        set((s) =>
          updateActive(s, (w) => ({
            ...w,
            exercises: [
              ...w.exercises,
              ...ids.map((exerciseId) => {
                const prev = lastSets(s.history, exerciseId);
                const count = Math.max(prev.length, 3);
                return {
                  id: uid(),
                  exerciseId,
                  restSec: s.settings.defaultRestSec,
                  sets: Array.from({ length: count }, (_, i) => newSet(prev[i] ?? prev[prev.length - 1])),
                };
              }),
            ],
          }))
        ),
      replaceExercise: (instanceId, exerciseId) =>
        set((s) => updateActive(s, (w) => mapExercise(w, instanceId, (e) => ({ ...e, exerciseId })))),
      removeExercise: (instanceId) =>
        set((s) => updateActive(s, (w) => ({ ...w, exercises: w.exercises.filter((e) => e.id !== instanceId) }))),
      moveExercise: (instanceId, dir) =>
        set((s) =>
          updateActive(s, (w) => {
            const i = w.exercises.findIndex((e) => e.id === instanceId);
            const j = i + dir;
            if (i < 0 || j < 0 || j >= w.exercises.length) return w;
            const list = [...w.exercises];
            [list[i], list[j]] = [list[j], list[i]];
            return { ...w, exercises: list };
          })
        ),
      setExerciseField: (instanceId, patch) =>
        set((s) => updateActive(s, (w) => mapExercise(w, instanceId, (e) => ({ ...e, ...patch })))),
      addSet: (instanceId) =>
        set((s) =>
          updateActive(s, (w) =>
            mapExercise(w, instanceId, (e) => {
              const last = e.sets[e.sets.length - 1];
              return { ...e, sets: [...e.sets, newSet(last ? { ...last, type: last.type === 'warmup' ? 'normal' : last.type } : undefined)] };
            })
          )
        ),
      removeSet: (instanceId, setId) =>
        set((s) =>
          updateActive(s, (w) => mapExercise(w, instanceId, (e) => ({ ...e, sets: e.sets.filter((x) => x.id !== setId) })))
        ),
      updateSet: (instanceId, setId, patch) =>
        set((s) =>
          updateActive(s, (w) =>
            mapExercise(w, instanceId, (e) => {
              const idx = e.sets.findIndex((x) => x.id === setId);
              const before = e.sets[idx];
              return {
                ...e,
                sets: e.sets.map((x, i) => {
                  if (i === idx) return { ...x, ...patch };
                  // Typing a weight/reps carries it down to later, untouched working sets.
                  if (i < idx || x.done || x.type === 'warmup' || !before || before.type === 'warmup') return x;
                  const next = { ...x };
                  if ('weightKg' in patch && x.weightKg === before.weightKg) next.weightKg = patch.weightKg;
                  if ('reps' in patch && x.reps === before.reps) next.reps = patch.reps;
                  return next;
                }),
              };
            })
          )
        ),
      toggleSetDone: (instanceId, setId) => {
        const { active } = get();
        const ex = active?.exercises.find((e) => e.id === instanceId);
        const target = ex?.sets.find((x) => x.id === setId);
        if (!ex || !target) return;
        const nowDone = !target.done;
        get().updateSet(instanceId, setId, { done: nowDone });
        if (nowDone && ex.restSec > 0) get().startRest(ex.restSec);
      },

      startRest: (sec) => set({ rest: { endsAt: Date.now() + sec * 1000, totalSec: sec } }),
      adjustRest: (delta) =>
        set((s) => {
          if (!s.rest) return {};
          const endsAt = s.rest.endsAt + delta * 1000;
          if (endsAt <= Date.now()) return { rest: null };
          return { rest: { endsAt, totalSec: Math.max(1, s.rest.totalSec + delta) } };
        }),
      stopRest: () => set({ rest: null }),

      deleteWorkout: (id) => set((s) => ({ history: s.history.filter((w) => w.id !== id) })),
      updateHistoryWorkout: (w) =>
        set((s) => ({ history: s.history.map((x) => (x.id === w.id ? w : x)).sort((a, b) => b.startedAt - a.startedAt) })),
      importData: (data) =>
        set((s) => ({
          settings: { ...s.settings, ...(data.settings ?? {}) },
          customExercises: data.customExercises ?? s.customExercises,
          templates: data.templates ?? s.templates,
          history: (data.history ?? s.history).sort((a, b) => b.startedAt - a.startedAt),
        })),
      resetAll: () =>
        set({ settings: DEFAULT_SETTINGS, customExercises: [], templates: [], history: [], active: null, rest: null }),
    }),
    {
      name: 'bicapp-store',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        settings: s.settings,
        customExercises: s.customExercises,
        templates: s.templates,
        history: s.history,
        active: s.active,
        rest: s.rest,
      }),
    }
  )
);

function timeOfDayName() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning Workout';
  if (h < 17) return 'Afternoon Workout';
  return 'Evening Workout';
}

/* ---------- selectors ---------- */

export function findExercise(id: string, custom: Exercise[]): Exercise | undefined {
  return getBuiltinExercise(id) ?? custom.find((e) => e.id === id);
}

export function useExercise(id: string | undefined) {
  const custom = useStore((s) => s.customExercises);
  return id ? findExercise(id, custom) : undefined;
}

export function useAllExercises() {
  const custom = useStore((s) => s.customExercises);
  return useMemo(
    () => [...custom, ...BUILTIN_EXERCISES].sort((a, b) => a.name.localeCompare(b.name)),
    [custom]
  );
}

export function useAllTemplates() {
  const templates = useStore((s) => s.templates);
  return { mine: templates, builtin: BUILTIN_TEMPLATES };
}

export function findTemplate(id: string, mine: Template[]) {
  return mine.find((t) => t.id === id) ?? BUILTIN_TEMPLATES.find((t) => t.id === id);
}

export function templateFromWorkout(w: Workout, name?: string): Template {
  return {
    id: uid(),
    name: name ?? w.name,
    notes: w.notes,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    exercises: w.exercises.map((e) => ({
      exerciseId: e.exerciseId,
      restSec: e.restSec,
      notes: e.notes,
      sets: e.sets.map((s) => ({ type: s.type, reps: s.reps, weightKg: s.weightKg, durationSec: s.durationSec })),
    })),
  };
}
