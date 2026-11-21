import { router, Stack, useLocalSearchParams } from 'expo-router';

import { WorkoutExerciseList, WorkoutStats } from '@/components/workout-summary';
import { Button, Card, Empty, Row, Screen, SectionHeader, T } from '@/components/ui';
import { fmtDate } from '@/lib/format';
import { beginWorkout } from '@/lib/start';
import { confirm, notify } from '@/lib/ui';
import { templateFromWorkout, useStore } from '@/store';

export default function HistoryDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const workout = useStore((s) => s.history.find((w) => w.id === id));
  const deleteWorkout = useStore((s) => s.deleteWorkout);
  const saveTemplate = useStore((s) => s.saveTemplate);

  if (!workout) {
    return (
      <Screen>
        <Empty icon="alert-circle-outline" title="Workout not found" />
      </Screen>
    );
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: fmtDate(workout.startedAt) }} />
      <T variant="title">{workout.name}</T>
      <T color="textSecondary">
        {new Date(workout.startedAt).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}
      </T>
      <WorkoutStats workout={workout} />
      {workout.notes ? (
        <Card>
          <T>{workout.notes}</T>
        </Card>
      ) : null}
      <Row>
        <Button style={{ flex: 1 }} icon="repeat" title="Repeat" onPress={() => beginWorkout({ repeat: workout })} />
        <Button
          style={{ flex: 1 }}
          variant="secondary"
          icon="albums-outline"
          title="Save as template"
          onPress={() => {
            saveTemplate(templateFromWorkout(workout));
            notify('Template saved', `"${workout.name}" is now in My templates.`);
          }}
        />
      </Row>
      <SectionHeader title="Exercises" />
      <WorkoutExerciseList workout={workout} detailed />
      <Button
        variant="danger"
        icon="trash-outline"
        title="Delete workout"
        onPress={async () => {
          if (await confirm('Delete workout?', 'This cannot be undone.', 'Delete', true)) {
            deleteWorkout(workout.id);
            router.back();
          }
        }}
      />
    </Screen>
  );
}
