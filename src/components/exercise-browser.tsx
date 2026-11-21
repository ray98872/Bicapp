import { useMemo, useState, type ReactElement } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';

import { MaxContentWidth, Spacing } from '@/constants/theme';
import { EQUIPMENT, MUSCLES, titleCase } from '@/data/exercises';
import { useTheme } from '@/hooks/use-theme';
import type { Exercise } from '@/lib/types';
import { useAllExercises, useStore } from '@/store';

import { ExerciseRow } from './exercise-row';
import { Chip, Empty, SearchBar, T } from './ui';

/** Searchable, filterable exercise list used by the Exercises tab and the picker. */
export function ExerciseBrowser({
  onSelect,
  selectedIds,
  footer,
  header,
}: {
  onSelect: (e: Exercise) => void;
  selectedIds?: string[];
  footer?: ReactElement;
  header?: ReactElement;
}) {
  const theme = useTheme();
  const all = useAllExercises();
  const history = useStore((s) => s.history);
  const [query, setQuery] = useState('');
  const [muscle, setMuscle] = useState<string | null>(null);
  const [equipment, setEquipment] = useState<string | null>(null);
  const [onlyUsed, setOnlyUsed] = useState(false);

  const usedIds = useMemo(() => {
    const s = new Set<string>();
    history.forEach((w) => w.exercises.forEach((e) => s.add(e.exerciseId)));
    return s;
  }, [history]);

  const list = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return all.filter((e) => {
      if (muscle && !e.primaryMuscles.includes(muscle)) return false;
      if (equipment && e.equipment !== equipment) return false;
      if (onlyUsed && !usedIds.has(e.id)) return false;
      if (!words.length) return true;
      const hay = `${e.name} ${e.primaryMuscles.join(' ')} ${e.equipment}`.toLowerCase();
      return words.every((w) => hay.includes(w));
    });
  }, [all, query, muscle, equipment, onlyUsed, usedIds]);

  const selected = new Set(selectedIds ?? []);

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={styles.content}
      data={list}
      keyExtractor={(e) => e.id}
      keyboardShouldPersistTaps="handled"
      initialNumToRender={20}
      windowSize={11}
      ListHeaderComponent={
        <View style={styles.header}>
          {header}
          <SearchBar placeholder={`Search ${all.length} exercises`} value={query} onChangeText={setQuery} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            <Chip label="My exercises" active={onlyUsed} onPress={() => setOnlyUsed((v) => !v)} />
            {MUSCLES.map((m) => (
              <Chip key={m} label={titleCase(m)} active={muscle === m} onPress={() => setMuscle(muscle === m ? null : m)} />
            ))}
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {EQUIPMENT.map((eq) => (
              <Chip
                key={eq}
                label={titleCase(eq)}
                active={equipment === eq}
                onPress={() => setEquipment(equipment === eq ? null : eq)}
              />
            ))}
          </ScrollView>
          <T variant="caption" color="textSecondary">
            {list.length} result{list.length === 1 ? '' : 's'}
          </T>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.rowWrap}>
          <ExerciseRow exercise={item} selected={selected.has(item.id)} onPress={() => onSelect(item)} />
        </View>
      )}
      ListEmptyComponent={<Empty icon="search" title="No exercises found" body="Try a different search or filter." />}
      ListFooterComponent={footer}
    />
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 120 },
  header: {
    gap: Spacing.two,
    padding: Spacing.three,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  chips: { gap: Spacing.two, paddingRight: Spacing.three },
  rowWrap: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', paddingHorizontal: Spacing.one },
});
