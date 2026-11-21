import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { ScrollView } from 'react-native';

import { Button, Chip, Input, Row, Screen, SectionHeader, T } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { EQUIPMENT, MUSCLES, titleCase } from '@/data/exercises';
import { uid } from '@/lib/format';
import type { Tracking } from '@/lib/types';
import { notify } from '@/lib/ui';
import { useStore } from '@/store';

const TRACKING: { key: Tracking; label: string }[] = [
  { key: 'weight', label: 'Weight × reps' },
  { key: 'reps', label: 'Reps only' },
  { key: 'duration', label: 'Time' },
];

export default function NewExercise() {
  const save = useStore((s) => s.saveCustomExercise);
  const [name, setName] = useState('');
  const [muscle, setMuscle] = useState('chest');
  const [equipment, setEquipment] = useState('barbell');
  const [tracking, setTracking] = useState<Tracking>('weight');
  const [steps, setSteps] = useState('');
  const [video, setVideo] = useState('');
  const [image, setImage] = useState('');

  function onSave() {
    if (!name.trim()) return notify('Name required', 'Give the exercise a name.');
    save({
      id: `custom-${uid()}`,
      name: name.trim(),
      category: tracking === 'duration' ? 'cardio' : 'strength',
      equipment,
      level: 'beginner',
      mechanic: null,
      primaryMuscles: [muscle],
      secondaryMuscles: [],
      instructions: steps.split('\n').map((s) => s.trim()).filter(Boolean),
      images: image.trim() ? [image.trim()] : [],
      tracking,
      videoUrl: video.trim() || undefined,
      isCustom: true,
    });
    router.back();
  }

  return (
    <Screen>
      <Stack.Screen
        options={{
          headerLeft: () => <Button title="Cancel" variant="ghost" size="sm" onPress={() => router.back()} />,
          headerRight: () => <Button title="Save" size="sm" onPress={onSave} />,
        }}
      />
      <Input placeholder="Exercise name" value={name} onChangeText={setName} style={{ fontSize: 20, fontWeight: '700' }} />

      <SectionHeader title="How do you track it?" />
      <Row style={{ flexWrap: 'wrap' }}>
        {TRACKING.map((t) => (
          <Chip key={t.key} label={t.label} active={tracking === t.key} onPress={() => setTracking(t.key)} />
        ))}
      </Row>

      <SectionHeader title="Primary muscle" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.two }}>
        {MUSCLES.map((m) => (
          <Chip key={m} label={titleCase(m)} active={muscle === m} onPress={() => setMuscle(m)} />
        ))}
      </ScrollView>

      <SectionHeader title="Equipment" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.two }}>
        {EQUIPMENT.map((e) => (
          <Chip key={e} label={titleCase(e)} active={equipment === e} onPress={() => setEquipment(e)} />
        ))}
      </ScrollView>

      <SectionHeader title="Instructions (one step per line)" />
      <Input multiline value={steps} onChangeText={setSteps} style={{ minHeight: 120, textAlignVertical: 'top' }} placeholder={'Set up…\nLower slowly…\nPress up…'} />

      <SectionHeader title="Video tutorial link (optional)" />
      <Input value={video} onChangeText={setVideo} autoCapitalize="none" placeholder="https://youtube.com/watch?v=…" />
      <SectionHeader title="Image link (optional)" />
      <Input value={image} onChangeText={setImage} autoCapitalize="none" placeholder="https://…/photo.jpg" />
      <T variant="caption" color="textSecondary">
        No video link? The app will search YouTube for a tutorial automatically.
      </T>
      <Button title="Save exercise" icon="checkmark" size="lg" onPress={onSave} />
    </Screen>
  );
}
