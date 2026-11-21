import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useNow } from '@/hooks/use-now';
import { useTheme } from '@/hooks/use-theme';
import { fmtClock } from '@/lib/format';
import { useStore } from '@/store';

import { Icon, T } from './ui';

/** Persistent "workout in progress" bar shown above the tab bar. */
export function ActiveWorkoutBar() {
  const theme = useTheme();
  const active = useStore((s) => s.active);
  const rest = useStore((s) => s.rest);
  const now = useNow(!!active);
  if (!active) return null;

  const restLeft = rest ? Math.max(0, Math.ceil((rest.endsAt - now) / 1000)) : 0;

  return (
    <Pressable onPress={() => router.push('/workout')} style={[styles.bar, { backgroundColor: theme.accent }]}>
      <View style={{ flex: 1 }}>
        <T variant="subheading" style={{ color: theme.accentText }} numberOfLines={1}>
          {active.name}
        </T>
        <T variant="small" style={{ color: theme.accentText, opacity: 0.85 }}>
          {fmtClock((now - active.startedAt) / 1000)}
          {restLeft > 0 ? `  ·  Rest ${fmtClock(restLeft)}` : ''}
        </T>
      </View>
      <Icon name="chevron-up" color={theme.accentText} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    gap: Spacing.two,
  },
});
