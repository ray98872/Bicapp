import * as WebBrowser from 'expo-web-browser';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { ProgressChart } from '@/components/progress-chart';
import { ExerciseAnimation } from '@/components/exercise-media';
import { Button, Card, Chip, Empty, Row, Screen, SectionHeader, Stat, T, Tag } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { titleCase, videoUrl } from '@/data/exercises';
import { fmtDate, fmtWeight } from '@/lib/format';
import { estimate1RM, exerciseSessions, personalRecords } from '@/lib/stats';
import { confirm } from '@/lib/ui';
import { useExercise, useStore } from '@/store';

type Tab = 'guide' | 'history' | 'records';

export default function ExerciseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const exercise = useExercise(id);
  const history = useStore((s) => s.history);
  const units = useStore((s) => s.settings.units);
  const deleteCustom = useStore((s) => s.deleteCustomExercise);
  const [tab, setTab] = useState<Tab>('guide');

  const sessions = useMemo(() => exerciseSessions(history, id), [history, id]);
  const prs = useMemo(() => personalRecords(history, id), [history, id]);

  if (!exercise) {
    return (
      <Screen>
        <Empty icon="alert-circle-outline" title="Exercise not found" />
      </Screen>
    );
  }

  const isDuration = exercise.tracking === 'duration';
  const isWeighted = exercise.tracking === 'weight';

  return (
    <Screen>
      <Stack.Screen options={{ title: '' }} />
      <T variant="title">{exercise.name}</T>
      <Row style={{ flexWrap: 'wrap' }}>
        <Tag label={titleCase(exercise.level)} tone="accentSoft" />
        <Tag label={titleCase(exercise.equipment)} />
        <Tag label={titleCase(exercise.category)} />
        {exercise.mechanic && <Tag label={titleCase(exercise.mechanic)} />}
        {exercise.isCustom && <Tag label="Custom" />}
      </Row>

      <Row>
        {(['guide', 'history', 'records'] as Tab[]).map((t) => (
          <Chip key={t} label={titleCase(t)} active={tab === t} onPress={() => setTab(t)} />
        ))}
      </Row>

      {tab === 'guide' && (
        <>
          <ExerciseAnimation exercise={exercise} height={280} />
          <Button
            icon="logo-youtube"
            title="Watch video tutorial"
            size="lg"
            onPress={() => WebBrowser.openBrowserAsync(videoUrl(exercise))}
          />
          <Card>
            <SectionHeader title="Muscles worked" />
            <Row style={{ flexWrap: 'wrap' }}>
              {exercise.primaryMuscles.map((m) => (
                <Tag key={m} label={`${titleCase(m)} · primary`} tone="accentSoft" />
              ))}
              {exercise.secondaryMuscles.map((m) => (
                <Tag key={m} label={titleCase(m)} />
              ))}
            </Row>
          </Card>
          <Card>
            <SectionHeader title="How to do it" />
            {exercise.instructions.length === 0 && <T color="textSecondary">No instructions yet.</T>}
            {exercise.instructions.map((step, i) => (
              <Row key={i} gap={Spacing.three} style={{ alignItems: 'flex-start' }}>
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 13,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <T variant="subheading" color="accent">
                    {i + 1}
                  </T>
                </View>
                <T style={{ flex: 1 }}>{step}</T>
              </Row>
            ))}
          </Card>
          <Card tone="accentSoft">
            <T variant="subheading">Beginner tips</T>
            <T variant="small">• Start lighter than you think. Perfect reps first, weight later.</T>
            <T variant="small">• Move with control — about 2 seconds down, 1 second up.</T>
            <T variant="small">• Breathe out on the hard part of the rep.</T>
            <T variant="small">• Sharp pain means stop. Muscle burn is normal.</T>
          </Card>
          {exercise.isCustom && (
            <Button
              variant="danger"
              icon="trash-outline"
              title="Delete custom exercise"
              onPress={async () => {
                if (await confirm('Delete exercise?', 'Past sets stay in your history.', 'Delete', true)) {
                  deleteCustom(exercise.id);
                  router.back();
                }
              }}
            />
          )}
        </>
      )}

      {tab === 'history' && (
        <>
          {sessions.length === 0 ? (
            <Empty icon="time-outline" title="No history yet" body="Log this exercise in a workout to see it here." />
          ) : (
            <>
              {isWeighted && (
                <Card>
                  <SectionHeader title={`Estimated 1RM (${units})`} />
                  <ProgressChart
                    points={[...sessions].reverse().map((s) => ({ date: s.date, value: s.best1RM }))}
                    format={(v) => fmtWeight(v, units, false)}
                  />
                </Card>
              )}
              {sessions.map((s) => (
                <Card key={s.workoutId} onPress={() => router.push(`/history/${s.workoutId}`)}>
                  <T variant="subheading">{fmtDate(s.date)}</T>
                  {s.sets.map((set, i) => (
                    <Row key={set.id} style={{ justifyContent: 'space-between' }}>
                      <T variant="small" color="textSecondary">
                        {set.type === 'warmup' ? 'W' : s.sets.slice(0, i + 1).filter((x) => x.type !== 'warmup').length}
                      </T>
                      <T variant="small" style={{ flex: 1, marginLeft: Spacing.three }}>
                        {isDuration
                          ? `${set.durationSec ?? 0}s`
                          : isWeighted && set.weightKg
                            ? `${fmtWeight(set.weightKg, units)} × ${set.reps ?? 0}`
                            : `${set.reps ?? 0} reps`}
                      </T>
                      {isWeighted && !!set.weightKg && set.type !== 'warmup' && (
                        <T variant="caption" color="textSecondary">
                          1RM {fmtWeight(estimate1RM(set.weightKg, set.reps), units)}
                        </T>
                      )}
                    </Row>
                  ))}
                </Card>
              ))}
            </>
          )}
        </>
      )}

      {tab === 'records' && (
        <>
          {sessions.length === 0 ? (
            <Empty icon="trophy-outline" title="No records yet" body="Your personal bests will show up here." />
          ) : (
            <>
              <Row>
                {isWeighted && <Stat label="Est. 1RM" value={fmtWeight(prs.best1RM, units)} />}
                {isWeighted && <Stat label="Heaviest" value={fmtWeight(prs.maxWeight, units)} />}
                {isDuration && <Stat label="Longest" value={`${prs.longestSec}s`} />}
              </Row>
              <Row>
                <Stat label="Most reps" value={String(prs.maxReps)} />
                {isWeighted && <Stat label="Best volume" value={fmtWeight(prs.maxVolume, units)} />}
                <Stat label="Sessions" value={String(sessions.length)} />
              </Row>
            </>
          )}
        </>
      )}
    </Screen>
  );
}
