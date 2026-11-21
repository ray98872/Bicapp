import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Exercise } from '@/lib/types';

import { ExerciseThumb, exerciseSubtitle } from './exercise-media';
import { Icon, T } from './ui';

export const ExerciseRow = memo(function ExerciseRow({
  exercise,
  onPress,
  selected,
  right,
}: {
  exercise: Exercise;
  onPress: () => void;
  selected?: boolean;
  right?: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: selected ? theme.accentSoft : 'transparent' },
        pressed && { opacity: 0.6 },
      ]}>
      <ExerciseThumb exercise={exercise} />
      <View style={{ flex: 1 }}>
        <T numberOfLines={1}>{exercise.name}</T>
        <T variant="small" color="textSecondary" numberOfLines={1}>
          {exerciseSubtitle(exercise)}
          {exercise.isCustom ? ' · Custom' : ''}
        </T>
      </View>
      {right ?? (selected ? <Icon name="checkmark-circle" color="accent" size={24} /> : null)}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: 10,
    paddingHorizontal: Spacing.three,
    borderRadius: 12,
  },
});
