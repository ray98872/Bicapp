import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { imageUrl, titleCase } from '@/data/exercises';
import { useTheme } from '@/hooks/use-theme';
import type { Exercise } from '@/lib/types';

import { Icon, T } from './ui';

/** Loops the start/end photos of an exercise so beginners can see the movement. */
export function ExerciseAnimation({ exercise, height = 240 }: { exercise: Exercise; height?: number }) {
  const theme = useTheme();
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(true);
  const frames = exercise.images;

  useEffect(() => {
    if (!playing || frames.length < 2) return;
    const t = setInterval(() => setFrame((f) => (f + 1) % frames.length), 1100);
    return () => clearInterval(t);
  }, [playing, frames.length]);

  if (!frames.length) {
    return (
      <View style={[styles.placeholder, { height, backgroundColor: theme.backgroundSelected }]}>
        <Icon name="barbell-outline" size={48} color="textSecondary" />
        <T color="textSecondary">No demo images yet</T>
      </View>
    );
  }

  return (
    <Pressable onPress={() => setPlaying((p) => !p)} style={[styles.frame, { height, backgroundColor: '#fff' }]}>
      {frames.map((src, i) => (
        <Image
          key={src}
          source={{ uri: imageUrl(src) }}
          style={[StyleSheet.absoluteFill, { opacity: i === frame ? 1 : 0 }]}
          contentFit="contain"
          cachePolicy="memory-disk"
          transition={250}
        />
      ))}
      <View style={styles.badges}>
        <View style={styles.badge}>
          <Icon name={playing ? 'pause' : 'play'} size={12} color="#fff" />
          <T variant="caption" style={{ color: '#fff' }}>
            {frames.length > 1 ? (frame === 0 ? 'Start' : 'Finish') : 'Position'}
          </T>
        </View>
      </View>
    </Pressable>
  );
}

export function ExerciseThumb({ exercise, size = 48 }: { exercise?: Exercise; size?: number }) {
  const theme = useTheme();
  const src = exercise?.images[0];
  return (
    <View style={[styles.thumb, { width: size, height: size, backgroundColor: src ? '#fff' : theme.backgroundSelected }]}>
      {src ? (
        <Image source={{ uri: imageUrl(src) }} style={StyleSheet.absoluteFill} contentFit="cover" cachePolicy="memory-disk" />
      ) : (
        <T variant="subheading" color="textSecondary">
          {exercise?.name.charAt(0) ?? '?'}
        </T>
      )}
    </View>
  );
}

export function exerciseSubtitle(e: Exercise) {
  return [titleCase(e.primaryMuscles[0] ?? e.category), titleCase(e.equipment)].join(' · ');
}

const styles = StyleSheet.create({
  frame: { borderRadius: Radius.md, overflow: 'hidden' },
  placeholder: { borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', gap: Spacing.two },
  badges: { position: 'absolute', left: 10, bottom: 10, flexDirection: 'row' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  thumb: { borderRadius: 10, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
});
