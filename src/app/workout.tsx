import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { router, Stack } from 'expo-router';
import { memo, useEffect, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ExerciseThumb } from '@/components/exercise-media';
import { NumberCell, SetTypeBadge, nextSetType } from '@/components/set-cells';
import { Button, Card, Empty, Icon, IconButton, Row, Screen, Stat, T } from '@/components/ui';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useNow } from '@/hooks/use-now';
import { useTheme } from '@/hooks/use-theme';
import { displayToKg, fmtClock, fmtVolume, fmtWeight, kgToDisplay } from '@/lib/format';
import { workoutSetCount, workoutVolume } from '@/lib/stats';
import type { Workout, WorkoutExercise, WorkoutSet } from '@/lib/types';
import { confirm, haptic, setPickHandler } from '@/lib/ui';
import { findExercise, templateFromWorkout, useStore } from '@/store';

const REST_STEPS = [0, 30, 45, 60, 75, 90, 120, 150, 180, 240, 300];

export default function ActiveWorkout() {
  const theme = useTheme();
  const active = useStore((s) => s.active);
  const keepAwake = useStore((s) => s.settings.keepAwake);
  const now = useNow(!!active);

  useEffect(() => {
    if (!active || !keepAwake) return;
    activateKeepAwakeAsync('workout').catch(() => {});
    return () => {
      deactivateKeepAwake('workout').catch(() => {});
    };
  }, [active, keepAwake]);

  if (!active) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Workout' }} />
        <Empty
          icon="checkmark-done-circle-outline"
          title="No workout in progress"
          action={<Button title="Back" onPress={() => router.back()} />}
        />
      </Screen>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Stack.Screen
        options={{
          title: fmtClock((now - active.startedAt) / 1000),
          headerLeft: () => <IconButton name="chevron-down" label="Minimise" onPress={() => router.back()} />,
          headerRight: () => <Button title="Finish" variant="success" size="sm" onPress={() => finish(active)} />,
        }}
      />
      <Screen contentStyle={{ paddingBottom: 140 }}>
        <WorkoutHeader workout={active} />
        {active.exercises.map((e, i) => (
          <ExerciseCard key={e.id} we={e} index={i} count={active.exercises.length} />
        ))}
        {active.exercises.length === 0 && (
          <Card>
            <Empty icon="barbell-outline" title="Empty workout" body="Add exercises to start logging sets." />
          </Card>
        )}
        <Button title="Add exercises" icon="add" size="lg" variant="secondary" onPress={pickExercises} />
        <Button title="Cancel workout" icon="close" variant="danger" onPress={cancelWorkout} />
      </Screen>
      <RestTimerPanel />
    </View>
  );
}

function pickExercises() {
  setPickHandler((ids) => useStore.getState().addExercises(ids));
  router.push('/picker');
}

async function cancelWorkout() {
  if (await confirm('Cancel workout?', 'Nothing from this session will be saved.', 'Cancel workout', true)) {
    useStore.getState().discardWorkout();
    router.back();
  }
}

async function finish(active: Workout) {
  const store = useStore.getState();
  const total = active.exercises.reduce((n, e) => n + e.sets.length, 0);
  const done = workoutSetCount(active);
  if (done === 0) {
    if (await confirm('No sets completed', 'Tick off at least one set, or discard this workout?', 'Discard', true)) {
      store.discardWorkout();
      router.back();
    }
    return;
  }
  if (done < total) {
    const ok = await confirm('Finish workout?', `${total - done} unfinished set(s) will be discarded.`, 'Finish');
    if (!ok) return;
  }
  const saved = store.finishWorkout();
  if (!saved) return;
  haptic('success');

  const tpl = saved.templateId ? store.templates.find((t) => t.id === saved.templateId) : undefined;
  if (tpl) {
    const update = await confirm('Update template?', `Save today's exercises, sets and weights to "${tpl.name}"?`, 'Update');
    if (update) store.saveTemplate({ ...templateFromWorkout(saved, tpl.name), id: tpl.id, createdAt: tpl.createdAt, folder: tpl.folder, notes: tpl.notes });
  }
  router.replace(`/summary/${saved.id}`);
}

function WorkoutHeader({ workout }: { workout: Workout }) {
  const theme = useTheme();
  const units = useStore((s) => s.settings.units);
  const rename = useStore((s) => s.renameWorkout);
  const setNotes = useStore((s) => s.setWorkoutNotes);
  const total = workout.exercises.reduce((n, e) => n + e.sets.length, 0);
  return (
    <View style={{ gap: Spacing.two }}>
      <TextInput
        value={workout.name}
        onChangeText={rename}
        style={[styles.nameInput, { color: theme.text }]}
        placeholder="Workout name"
        placeholderTextColor={theme.textSecondary}
      />
      <Row>
        <Stat label="Sets" value={`${workoutSetCount(workout)}/${total}`} />
        <Stat label="Volume" value={fmtVolume(workoutVolume(workout), units)} />
        <Stat label="Exercises" value={String(workout.exercises.length)} />
      </Row>
      <TextInput
        value={workout.notes ?? ''}
        onChangeText={setNotes}
        placeholder="Workout notes…"
        placeholderTextColor={theme.textSecondary}
        multiline
        style={[styles.notes, { color: theme.text }]}
      />
    </View>
  );
}

const ExerciseCard = memo(function ExerciseCard({ we, index, count }: { we: WorkoutExercise; index: number; count: number }) {
  const theme = useTheme();
  const custom = useStore((s) => s.customExercises);
  const history = useStore((s) => s.history);
  const units = useStore((s) => s.settings.units);
  const { addSet, removeExercise, moveExercise, setExerciseField, replaceExercise } = useStore.getState();
  const ex = findExercise(we.exerciseId, custom);
  const tracking = ex?.tracking ?? 'weight';

  const previous = useMemo(() => {
    for (const w of history) {
      const sets = w.exercises.filter((e) => e.exerciseId === we.exerciseId).flatMap((e) => e.sets);
      if (sets.length) return sets;
    }
    return [] as WorkoutSet[];
  }, [history, we.exerciseId]);

  const numbers = we.sets.reduce<number[]>((acc, s) => {
    const prevN = acc.length ? acc[acc.length - 1] : 0;
    acc.push(s.type === 'warmup' ? prevN : prevN + 1);
    return acc;
  }, []);

  return (
    <Card>
      <Row gap={Spacing.three}>
        <Pressable onPress={() => router.push(`/exercise/${we.exerciseId}`)} style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.three, flex: 1 }}>
          <ExerciseThumb exercise={ex} size={44} />
          <View style={{ flex: 1 }}>
            <T variant="subheading" color="accent" numberOfLines={2}>
              {ex?.name ?? 'Unknown exercise'}
            </T>
            <Row gap={4}>
              <Icon name="help-circle-outline" size={14} color="textSecondary" />
              <T variant="caption" color="textSecondary">
                How to do it
              </T>
            </Row>
          </View>
        </Pressable>
        <IconButton name="swap-horizontal" color="textSecondary" label="Replace exercise" onPress={() => {
          setPickHandler((ids) => ids[0] && replaceExercise(we.id, ids[0]), false);
          router.push('/picker');
        }} />
        {index > 0 && <IconButton name="arrow-up" color="textSecondary" label="Move up" onPress={() => moveExercise(we.id, -1)} />}
        {index < count - 1 && <IconButton name="arrow-down" color="textSecondary" label="Move down" onPress={() => moveExercise(we.id, 1)} />}
        <IconButton
          name="trash-outline"
          color="danger"
          label="Remove exercise"
          onPress={async () => {
            if (await confirm('Remove exercise?', `Remove ${ex?.name ?? 'this exercise'} and its sets?`, 'Remove', true)) removeExercise(we.id);
          }}
        />
      </Row>

      <TextInput
        value={we.notes ?? ''}
        onChangeText={(notes) => setExerciseField(we.id, { notes })}
        placeholder="Add a note…"
        placeholderTextColor={theme.textSecondary}
        style={[styles.exNote, { color: theme.text }]}
      />

      <Row style={styles.colHead}>
        <T variant="caption" color="textSecondary" style={styles.cSet}>SET</T>
        <T variant="caption" color="textSecondary" style={styles.cPrev}>PREVIOUS</T>
        {tracking === 'weight' && <T variant="caption" color="textSecondary" style={styles.cNum}>{units.toUpperCase()}</T>}
        <T variant="caption" color="textSecondary" style={styles.cNum}>{tracking === 'duration' ? 'SEC' : 'REPS'}</T>
        <View style={styles.cCheck}><Icon name="checkmark" size={16} color="textSecondary" /></View>
      </Row>

      {we.sets.map((s, si) => (
        <SetRow key={s.id} instanceId={we.id} set={s} number={numbers[si]} prev={previous[si]} tracking={tracking} />
      ))}

      <Row>
        <Button style={{ flex: 1 }} size="sm" variant="secondary" icon="add" title="Add set" onPress={() => addSet(we.id)} />
        <Button
          size="sm"
          variant="secondary"
          icon="timer-outline"
          title={we.restSec ? fmtClock(we.restSec) : 'Off'}
          onPress={() => setExerciseField(we.id, { restSec: REST_STEPS[(REST_STEPS.indexOf(we.restSec) + 1) % REST_STEPS.length] ?? 90 })}
        />
      </Row>
      {previous.length > 0 && tracking === 'weight' && (
        <T variant="caption" color="textSecondary">
          Last time best: {fmtWeight(Math.max(...previous.map((p) => p.weightKg ?? 0)), units)}
        </T>
      )}
    </Card>
  );
});

const SetRow = memo(function SetRow({
  instanceId,
  set,
  number,
  prev,
  tracking,
}: {
  instanceId: string;
  set: WorkoutSet;
  number: number;
  prev?: WorkoutSet;
  tracking: 'weight' | 'reps' | 'duration';
}) {
  const theme = useTheme();
  const units = useStore((s) => s.settings.units);
  const { updateSet, toggleSetDone, removeSet } = useStore.getState();
  const prevText = !prev
    ? '—'
    : tracking === 'duration'
      ? `${prev.durationSec ?? 0}s`
      : tracking === 'reps'
        ? `${prev.reps ?? 0} reps`
        : prev.weightKg
          ? `${fmtWeight(prev.weightKg, units, false)} × ${prev.reps ?? 0}`
          : `${prev.reps ?? 0} reps`;

  function copyPrev() {
    if (!prev) return;
    updateSet(instanceId, set.id, { weightKg: prev.weightKg, reps: prev.reps, durationSec: prev.durationSec });
  }

  function toggle() {
    // Fill blanks from previous/placeholder so a quick tick still logs something sensible.
    if (!set.done) {
      const patch: Partial<WorkoutSet> = {};
      if (tracking === 'weight' && set.weightKg === undefined && prev?.weightKg !== undefined) patch.weightKg = prev.weightKg;
      if (tracking !== 'duration' && set.reps === undefined && prev?.reps !== undefined) patch.reps = prev.reps;
      if (tracking === 'duration' && set.durationSec === undefined && prev?.durationSec !== undefined) patch.durationSec = prev.durationSec;
      if (Object.keys(patch).length) updateSet(instanceId, set.id, patch);
    }
    haptic(set.done ? 'light' : 'success');
    toggleSetDone(instanceId, set.id);
  }

  return (
    <View style={[styles.setRow, set.done && { backgroundColor: theme.successSoft }]}>
      <Pressable
        style={styles.cSet}
        onPress={() => updateSet(instanceId, set.id, { type: nextSetType(set.type) })}
        onLongPress={() => removeSet(instanceId, set.id)}>
        <SetTypeBadge type={set.type} index={number} done={set.done} />
      </Pressable>
      <Pressable style={styles.cPrev} onPress={copyPrev}>
        <T variant="small" color="textSecondary" numberOfLines={1}>
          {prevText}
        </T>
      </Pressable>
      {tracking === 'weight' && (
        <View style={styles.cNum}>
          <NumberCell
            decimal
            highlight={set.done}
            value={kgToDisplay(set.weightKg, units)}
            placeholder={prev ? fmtWeight(prev.weightKg, units, false) : '0'}
            onChange={(v) => updateSet(instanceId, set.id, { weightKg: displayToKg(v, units) })}
          />
        </View>
      )}
      <View style={styles.cNum}>
        <NumberCell
          highlight={set.done}
          value={tracking === 'duration' ? set.durationSec : set.reps}
          placeholder={String((tracking === 'duration' ? prev?.durationSec : prev?.reps) ?? 0)}
          onChange={(v) => updateSet(instanceId, set.id, tracking === 'duration' ? { durationSec: v } : { reps: v })}
        />
      </View>
      <Pressable
        accessibilityLabel={set.done ? 'Mark set not done' : 'Complete set'}
        onPress={toggle}
        style={[styles.cCheck, styles.check, { backgroundColor: set.done ? theme.success : theme.backgroundSelected }]}>
        <Icon name="checkmark" size={22} color={set.done ? theme.accentText : theme.textSecondary} />
      </Pressable>
    </View>
  );
});

function RestTimerPanel() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const rest = useStore((s) => s.rest);
  const { adjustRest, stopRest } = useStore.getState();
  const now = useNow(!!rest, 250);
  const fired = useRef<number | null>(null);
  const left = rest ? Math.max(0, Math.ceil((rest.endsAt - now) / 1000)) : 0;

  useEffect(() => {
    if (rest && left === 0 && fired.current !== rest.endsAt) {
      fired.current = rest.endsAt;
      haptic('warning');
      stopRest();
    }
  }, [rest, left, stopRest]);

  if (!rest || left === 0) return null;
  const progress = 1 - left / rest.totalSec;

  return (
    <View style={[styles.restWrap, { paddingBottom: insets.bottom + Spacing.three }]}>
      <View style={[styles.rest, { backgroundColor: theme.accent }]}>
        <View style={[styles.restProgress, { width: `${progress * 100}%`, backgroundColor: 'rgba(255,255,255,0.18)' }]} />
        <Row style={{ justifyContent: 'space-between' }}>
          <View>
            <T variant="caption" style={{ color: theme.accentText, opacity: 0.85 }}>
              REST
            </T>
            <T style={{ color: theme.accentText, fontSize: 34, lineHeight: 40, fontWeight: '800', fontVariant: ['tabular-nums'] }}>
              {fmtClock(left)}
            </T>
          </View>
          <Row>
            <RestBtn label="−15" onPress={() => adjustRest(-15)} />
            <RestBtn label="+15" onPress={() => adjustRest(15)} />
            <RestBtn label="Skip" onPress={stopRest} />
          </Row>
        </Row>
      </View>
    </View>
  );
}

function RestBtn({ label, onPress }: { label: string; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.restBtn, { opacity: pressed ? 0.6 : 1 }]}>
      <T variant="subheading" style={{ color: theme.accentText }}>
        {label}
      </T>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  nameInput: { fontSize: 28, fontWeight: '800', paddingVertical: 4 },
  notes: { fontSize: 15, paddingVertical: 4 },
  exNote: { fontSize: 14, paddingVertical: 2 },
  colHead: { marginTop: Spacing.one, gap: 6 },
  setRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4, borderRadius: 10 },
  cSet: { width: 40, alignItems: 'center' },
  cPrev: { flex: 1.3, alignItems: 'center' },
  cNum: { flex: 1, alignItems: 'center' },
  cCheck: { width: 44, alignItems: 'center' },
  check: { height: 40, borderRadius: 10, justifyContent: 'center' },
  restWrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: Spacing.three, alignItems: 'center' },
  rest: { width: '100%', maxWidth: MaxContentWidth, borderRadius: Radius.lg, padding: Spacing.three, overflow: 'hidden' },
  restProgress: { position: 'absolute', left: 0, top: 0, bottom: 0 },
  restBtn: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)' },
});
