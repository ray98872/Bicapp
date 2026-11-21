import * as WebBrowser from 'expo-web-browser';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { ExerciseAnimation, ExerciseThumb, exerciseSubtitle } from '@/components/exercise-media';
import { Button, Card, Empty, Icon, Row, Screen, SectionHeader, T, Tag } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { videoUrl } from '@/data/exercises';
import { fmtClock, fmtWeight } from '@/lib/format';
import { beginWorkout } from '@/lib/start';
import type { TemplateExercise } from '@/lib/types';
import { confirm } from '@/lib/ui';
import { findExercise, findTemplate, useStore } from '@/store';

export default function TemplateDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const mine = useStore((s) => s.templates);
  const template = findTemplate(id, mine);
  const duplicateTemplate = useStore((s) => s.duplicateTemplate);
  const deleteTemplate = useStore((s) => s.deleteTemplate);

  if (!template) {
    return (
      <Screen>
        <Empty icon="alert-circle-outline" title="Template not found" />
      </Screen>
    );
  }

  const totalSets = template.exercises.reduce((n, e) => n + e.sets.length, 0);
  const estMin = Math.round(
    template.exercises.reduce((n, e) => n + e.sets.length * (45 + e.restSec), 0) / 60
  );

  async function onDelete() {
    if (await confirm('Delete template?', `"${template!.name}" will be removed. Your history is kept.`, 'Delete', true)) {
      deleteTemplate(template!.id);
      router.back();
    }
  }

  function onCopy() {
    const newId = duplicateTemplate(template!.id);
    if (newId) router.replace(`/template/edit?id=${newId}`);
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: template.builtin ? 'Programme' : 'Template' }} />
      <View style={{ gap: Spacing.two }}>
        <T variant="title">{template.name}</T>
        <Row style={{ flexWrap: 'wrap' }}>
          {template.folder && <Tag label={template.folder} />}
          <Tag label={`${template.exercises.length} exercises`} />
          <Tag label={`${totalSets} sets`} />
          <Tag label={`~${estMin} min`} />
        </Row>
        {template.notes ? <T color="textSecondary">{template.notes}</T> : null}
      </View>

      <Button title="Start workout" icon="play" size="lg" onPress={() => beginWorkout({ template })} />
      <Row>
        {template.builtin ? (
          <Button style={{ flex: 1 }} variant="secondary" icon="copy-outline" title="Copy & customise" onPress={onCopy} />
        ) : (
          <>
            <Button
              style={{ flex: 1 }}
              variant="secondary"
              icon="create-outline"
              title="Edit"
              onPress={() => router.push(`/template/edit?id=${template.id}`)}
            />
            <Button
              style={{ flex: 1 }}
              variant="secondary"
              icon="copy-outline"
              title="Duplicate"
              onPress={() => duplicateTemplate(template.id)}
            />
          </>
        )}
      </Row>

      <SectionHeader title="Workout guide" />
      <T variant="small" color="textSecondary">
        Tap an exercise to see how to do it. Every exercise has step-by-step instructions, a demo and a video
        tutorial.
      </T>
      {template.exercises.map((te, i) => (
        <GuideItem key={`${te.exerciseId}-${i}`} index={i} te={te} />
      ))}

      {!template.builtin && <Button variant="danger" icon="trash-outline" title="Delete template" onPress={onDelete} />}
    </Screen>
  );
}

function GuideItem({ te, index }: { te: TemplateExercise; index: number }) {
  const custom = useStore((s) => s.customExercises);
  const units = useStore((s) => s.settings.units);
  const ex = findExercise(te.exerciseId, custom);
  const [open, setOpen] = useState(false);

  const work = te.sets.filter((s) => s.type !== 'warmup');
  const warm = te.sets.length - work.length;
  const first = work[0];
  const target = first?.durationSec
    ? `${work.length} × ${first.durationSec}s`
    : `${work.length} × ${first?.reps ?? '—'} reps`;
  const weight = first?.weightKg ? ` @ ${fmtWeight(first.weightKg, units)}` : '';

  return (
    <Card>
      <Pressable onPress={() => setOpen((o) => !o)}>
        <Row gap={Spacing.three}>
          <ExerciseThumb exercise={ex} size={56} />
          <View style={{ flex: 1 }}>
            <T variant="caption" color="textSecondary">
              {index + 1}
            </T>
            <T variant="subheading">{ex?.name ?? 'Unknown exercise'}</T>
            <T variant="small" color="textSecondary">
              {target}
              {weight}
              {warm ? ` · ${warm} warm-up` : ''} · rest {fmtClock(te.restSec)}
            </T>
          </View>
          <Icon name={open ? 'chevron-up' : 'chevron-down'} color="textSecondary" />
        </Row>
      </Pressable>
      {te.notes ? (
        <T variant="small" color="accent">
          {te.notes}
        </T>
      ) : null}
      {open && ex && (
        <View style={{ gap: Spacing.three, marginTop: Spacing.two }}>
          <ExerciseAnimation exercise={ex} height={200} />
          <T variant="small" color="textSecondary">
            {exerciseSubtitle(ex)}
          </T>
          {ex.instructions.map((step, i) => (
            <Row key={i} gap={Spacing.two} style={{ alignItems: 'flex-start' }}>
              <T variant="small" color="accent" style={{ width: 18, fontWeight: '800' }}>
                {i + 1}
              </T>
              <T variant="small" style={{ flex: 1 }}>
                {step}
              </T>
            </Row>
          ))}
          <Row>
            <Button
              style={{ flex: 1 }}
              size="sm"
              icon="logo-youtube"
              title="Watch video"
              variant="secondary"
              onPress={() => WebBrowser.openBrowserAsync(videoUrl(ex))}
            />
            <Button
              style={{ flex: 1 }}
              size="sm"
              icon="information-circle-outline"
              title="Full guide"
              variant="secondary"
              onPress={() => router.push(`/exercise/${ex.id}`)}
            />
          </Row>
        </View>
      )}
    </Card>
  );
}
