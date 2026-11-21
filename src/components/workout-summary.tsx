import { router } from 'expo-router';
import { View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { fmtDuration, fmtVolume, fmtWeight } from '@/lib/format';
import type { Workout } from '@/lib/types';
import { findExercise, useStore } from '@/store';
import { workoutSetCount, workoutVolume } from '@/lib/stats';

import { Card, Row, Stat, T } from './ui';

export function WorkoutStats({ workout }: { workout: Workout }) {
  const units = useStore((s) => s.settings.units);
  return (
    <Row>
      <Stat label="Duration" value={workout.endedAt ? fmtDuration(workout.endedAt - workout.startedAt) : '—'} />
      <Stat label="Volume" value={fmtVolume(workoutVolume(workout), units)} />
      <Stat label="Sets" value={String(workoutSetCount(workout))} />
    </Row>
  );
}

export function WorkoutExerciseList({ workout, detailed }: { workout: Workout; detailed?: boolean }) {
  const custom = useStore((s) => s.customExercises);
  const units = useStore((s) => s.settings.units);
  return (
    <View style={{ gap: Spacing.two }}>
      {workout.exercises.map((e) => {
        const ex = findExercise(e.exerciseId, custom);
        const fmt = (s: (typeof e.sets)[number]) =>
          ex?.tracking === 'duration'
            ? `${s.durationSec ?? 0}s`
            : ex?.tracking === 'reps' || !s.weightKg
              ? `${s.reps ?? 0} reps`
              : `${fmtWeight(s.weightKg, units)} × ${s.reps ?? 0}`;
        if (!detailed) {
          return (
            <Row key={e.id} style={{ justifyContent: 'space-between' }}>
              <T variant="small" numberOfLines={1} style={{ flex: 1 }}>
                {e.sets.length} × {ex?.name ?? 'Unknown'}
              </T>
              <T variant="small" color="textSecondary">
                {e.sets[0] ? fmt(e.sets.reduce((a, b) => ((b.weightKg ?? 0) > (a.weightKg ?? 0) ? b : a))) : ''}
              </T>
            </Row>
          );
        }
        return (
          <Card key={e.id} onPress={() => router.push(`/exercise/${e.exerciseId}`)}>
            <T variant="subheading">{ex?.name ?? 'Unknown exercise'}</T>
            {e.notes ? (
              <T variant="small" color="accent">
                {e.notes}
              </T>
            ) : null}
            {e.sets.map((s, i) => (
              <Row key={s.id}>
                <T variant="small" color="textSecondary" style={{ width: 24 }}>
                  {s.type === 'warmup' ? 'W' : s.type === 'drop' ? 'D' : s.type === 'failure' ? 'F' : e.sets.slice(0, i + 1).filter((x) => x.type !== 'warmup').length}
                </T>
                <T variant="small">{fmt(s)}</T>
              </Row>
            ))}
          </Card>
        );
      })}
    </View>
  );
}
