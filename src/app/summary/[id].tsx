import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';

import { WorkoutExerciseList, WorkoutStats } from '@/components/workout-summary';
import { Button, Card, Empty, Icon, Row, Screen, SectionHeader, T } from '@/components/ui';
import { detectPRs } from '@/lib/stats';
import { notify } from '@/lib/ui';
import { findExercise, templateFromWorkout, useStore } from '@/store';

export default function Summary() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const history = useStore((s) => s.history);
  const custom = useStore((s) => s.customExercises);
  const templates = useStore((s) => s.templates);
  const saveTemplate = useStore((s) => s.saveTemplate);
  const workout = history.find((w) => w.id === id);

  const prs = useMemo(() => {
    if (!workout) return [];
    return detectPRs(workout, history.filter((w) => w.id !== workout.id && w.startedAt < workout.startedAt));
  }, [workout, history]);

  if (!workout) {
    return (
      <Screen>
        <Empty icon="alert-circle-outline" title="Workout not found" />
      </Screen>
    );
  }

  const fromUserTemplate = templates.some((t) => t.id === workout.templateId);
  const count = history.length;

  return (
    <Screen>
      <Stack.Screen options={{ headerLeft: () => null, headerRight: () => <Button title="Done" size="sm" onPress={() => router.dismissAll()} /> }} />
      <Row style={{ justifyContent: 'center', marginTop: 8 }}>
        <Icon name="trophy" size={56} color="warmup" />
      </Row>
      <T variant="title" style={{ textAlign: 'center' }}>
        Nice work!
      </T>
      <T color="textSecondary" style={{ textAlign: 'center' }}>
        That&apos;s workout #{count}. {workout.name} is in the books.
      </T>
      <WorkoutStats workout={workout} />

      {prs.length > 0 && (
        <Card tone="accentSoft">
          <T variant="subheading">🎉 {prs.length} personal record{prs.length === 1 ? '' : 's'}</T>
          {prs.map((p, i) => (
            <T key={i} variant="small">
              {findExercise(p.exerciseId, custom)?.name} — {p.kind}
            </T>
          ))}
        </Card>
      )}

      <SectionHeader title="Exercises" />
      <Card>
        <WorkoutExerciseList workout={workout} />
      </Card>

      {!fromUserTemplate && (
        <Button
          variant="secondary"
          icon="albums-outline"
          title="Save as template"
          onPress={() => {
            saveTemplate(templateFromWorkout(workout));
            notify('Template saved', `"${workout.name}" is now in My templates.`);
          }}
        />
      )}
      <Button title="Done" size="lg" onPress={() => router.dismissAll()} />
    </Screen>
  );
}
