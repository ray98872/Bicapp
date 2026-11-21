import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ExerciseThumb } from '@/components/exercise-media';
import { NumberCell, SetTypeBadge, nextSetType } from '@/components/set-cells';
import { Button, Card, Empty, IconButton, Input, Row, Screen, SectionHeader, T } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { displayToKg, fmtClock, kgToDisplay, uid } from '@/lib/format';
import type { Template, TemplateExercise, TemplateSet } from '@/lib/types';
import { confirm, notify, setPickHandler } from '@/lib/ui';
import { findExercise, useStore } from '@/store';

const REST_STEPS = [0, 30, 45, 60, 75, 90, 120, 150, 180, 240, 300];

export default function TemplateEditor() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existing = useStore((s) => s.templates.find((t) => t.id === id));
  const saveTemplate = useStore((s) => s.saveTemplate);
  const defaultRest = useStore((s) => s.settings.defaultRestSec);
  const custom = useStore((s) => s.customExercises);
  const history = useStore((s) => s.history);
  const units = useStore((s) => s.settings.units);

  const [draft, setDraft] = useState<Template>(
    () =>
      existing ? JSON.parse(JSON.stringify(existing)) : { id: uid(), name: '', notes: '', exercises: [], createdAt: 0, updatedAt: 0 }
  );
  const [dirty, setDirty] = useState(false);

  function update(fn: (t: Template) => Template) {
    setDraft((d) => fn(d));
    setDirty(true);
  }
  function updateExercise(i: number, fn: (e: TemplateExercise) => TemplateExercise) {
    update((t) => ({ ...t, exercises: t.exercises.map((e, j) => (j === i ? fn(e) : e)) }));
  }
  function updateSet(i: number, si: number, patch: Partial<TemplateSet>) {
    updateExercise(i, (e) => ({ ...e, sets: e.sets.map((s, j) => (j === si ? { ...s, ...patch } : s)) }));
  }

  function addExercises() {
    setPickHandler((ids) => {
      update((t) => ({
        ...t,
        exercises: [
          ...t.exercises,
          ...ids.map((exerciseId) => {
            const tracking = findExercise(exerciseId, custom)?.tracking;
            const base: TemplateSet = tracking === 'duration' ? { type: 'normal', durationSec: 30 } : { type: 'normal', reps: 10 };
            return { exerciseId, restSec: defaultRest, sets: [base, { ...base }, { ...base }] };
          }),
        ],
      }));
    });
    router.push('/picker');
  }

  function move(i: number, dir: -1 | 1) {
    update((t) => {
      const j = i + dir;
      if (j < 0 || j >= t.exercises.length) return t;
      const list = [...t.exercises];
      [list[i], list[j]] = [list[j], list[i]];
      return { ...t, exercises: list };
    });
  }

  function save() {
    const name = draft.name.trim();
    if (!name) {
      notify('Name your template', 'Give it a name so you can find it later.');
      return;
    }
    saveTemplate({ ...draft, name });
    router.back();
  }

  async function cancel() {
    if (!dirty || (await confirm('Discard changes?', 'Your edits to this template will be lost.', 'Discard', true))) {
      router.back();
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: existing ? 'Edit template' : 'New template',
          headerLeft: () => <Button title="Cancel" variant="ghost" size="sm" onPress={cancel} />,
          headerRight: () => <Button title="Save" size="sm" onPress={save} />,
        }}
      />
      <Screen>
        <Input
          placeholder="Template name (e.g. Push Day)"
          value={draft.name}
          onChangeText={(name) => update((t) => ({ ...t, name }))}
          style={{ fontSize: 20, fontWeight: '700' }}
        />
        <Input
          placeholder="Notes (optional)"
          value={draft.notes}
          multiline
          onChangeText={(notes) => update((t) => ({ ...t, notes }))}
        />
        <Input
          placeholder="Folder (optional, e.g. Summer cut)"
          value={draft.folder ?? ''}
          onChangeText={(folder) => update((t) => ({ ...t, folder: folder || undefined }))}
        />

        <SectionHeader title={`Exercises (${draft.exercises.length})`} />
        {draft.exercises.length === 0 && (
          <Card>
            <Empty icon="barbell-outline" title="Add your first exercise" body="Choose from 870+ exercises with guides." />
          </Card>
        )}
        {draft.exercises.map((te, i) => {
          const ex = findExercise(te.exerciseId, custom);
          const duration = ex?.tracking === 'duration';
          const bodyweight = ex?.tracking === 'reps';
          return (
            <Card key={`${te.exerciseId}-${i}`}>
              <Row gap={Spacing.three}>
                <ExerciseThumb exercise={ex} size={40} />
                <T variant="subheading" style={{ flex: 1 }} numberOfLines={2}>
                  {ex?.name ?? 'Unknown exercise'}
                </T>
                <IconButton name="arrow-up" label="Move up" color="textSecondary" onPress={() => move(i, -1)} />
                <IconButton name="arrow-down" label="Move down" color="textSecondary" onPress={() => move(i, 1)} />
                <IconButton
                  name="trash-outline"
                  label="Remove exercise"
                  color="danger"
                  onPress={() => update((t) => ({ ...t, exercises: t.exercises.filter((_, j) => j !== i) }))}
                />
              </Row>

              <Row style={styles.headRow}>
                <T variant="caption" color="textSecondary" style={styles.colSet}>SET</T>
                {!duration && !bodyweight && (
                  <T variant="caption" color="textSecondary" style={styles.colNum}>
                    {units.toUpperCase()}
                  </T>
                )}
                <T variant="caption" color="textSecondary" style={styles.colNum}>
                  {duration ? 'SECONDS' : 'REPS'}
                </T>
                <View style={{ width: 30 }} />
              </Row>
              {te.sets.map((s, si) => (
                <Row key={si} style={styles.setRow}>
                  <Pressable style={styles.colSet} onPress={() => updateSet(i, si, { type: nextSetType(s.type) })}>
                    <SetTypeBadge type={s.type} index={te.sets.slice(0, si + 1).filter((x) => x.type !== 'warmup').length} />
                  </Pressable>
                  {!duration && !bodyweight && (
                    <WeightCell kg={s.weightKg} onChange={(kg) => updateSet(i, si, { weightKg: kg })} />
                  )}
                  <View style={styles.colNum}>
                    <NumberCell
                      value={duration ? s.durationSec : s.reps}
                      placeholder="—"
                      onChange={(v) => updateSet(i, si, duration ? { durationSec: v } : { reps: v })}
                    />
                  </View>
                  <IconButton
                    name="close"
                    size={18}
                    color="textSecondary"
                    label="Remove set"
                    onPress={() => updateExercise(i, (e) => ({ ...e, sets: e.sets.filter((_, j) => j !== si) }))}
                  />
                </Row>
              ))}
              <Row>
                <Button
                  style={{ flex: 1 }}
                  size="sm"
                  variant="secondary"
                  icon="add"
                  title="Add set"
                  onPress={() =>
                    updateExercise(i, (e) => {
                      const last = e.sets[e.sets.length - 1];
                      return { ...e, sets: [...e.sets, last ? { ...last, type: 'normal' } : { type: 'normal', reps: 10 }] };
                    })
                  }
                />
                <Button
                  size="sm"
                  variant="secondary"
                  icon="timer-outline"
                  title={`Rest ${fmtClock(te.restSec)}`}
                  onPress={() =>
                    updateExercise(i, (e) => ({
                      ...e,
                      restSec: REST_STEPS[(REST_STEPS.indexOf(e.restSec) + 1) % REST_STEPS.length] ?? defaultRest,
                    }))
                  }
                />
              </Row>
              <Input
                placeholder="Exercise note (e.g. seat height 4)"
                value={te.notes ?? ''}
                onChangeText={(notes) => updateExercise(i, (e) => ({ ...e, notes: notes || undefined }))}
                style={{ paddingVertical: 8, fontSize: 14 }}
              />
            </Card>
          );
        })}
        <Button title="Add exercises" icon="add" variant="secondary" size="lg" onPress={addExercises} />
        <Button title="Save template" icon="checkmark" size="lg" onPress={save} />
        {history.length > 0 && !existing && (
          <T variant="caption" color="textSecondary" style={{ textAlign: 'center' }}>
            Tip: you can also save any past workout as a template from History.
          </T>
        )}
      </Screen>
    </>
  );
}

function WeightCell({ kg, onChange }: { kg?: number; onChange: (kg?: number) => void }) {
  const units = useStore((s) => s.settings.units);
  return (
    <View style={styles.colNum}>
      <NumberCell value={kgToDisplay(kg, units)} placeholder="—" decimal onChange={(v) => onChange(displayToKg(v, units))} />
    </View>
  );
}

const styles = StyleSheet.create({
  headRow: { marginTop: Spacing.two },
  setRow: { paddingVertical: 2 },
  colSet: { width: 44, alignItems: 'center' },
  colNum: { flex: 1, alignItems: 'center' },
});
