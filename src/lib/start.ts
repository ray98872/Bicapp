import { router } from 'expo-router';

import type { Template, Workout } from '@/lib/types';
import { useStore } from '@/store';

import { confirm } from './ui';

/** Starts a workout, asking first if one is already in progress. */
export async function beginWorkout(source?: { template?: Template; repeat?: Workout }) {
  const { active, startWorkout, repeatWorkout } = useStore.getState();
  if (active) {
    const ok = await confirm(
      'Workout in progress',
      `You already have "${active.name}" running. Discard it and start a new one?`,
      'Discard & start',
      true
    );
    if (!ok) {
      router.push('/workout');
      return;
    }
  }
  if (source?.repeat) repeatWorkout(source.repeat);
  else startWorkout(source?.template);
  router.push('/workout');
}
