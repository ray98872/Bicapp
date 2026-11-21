import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';

import { WorkoutExerciseList } from '@/components/workout-summary';
import { Button, Card, Empty, Icon, Row, SectionHeader, Stat, T } from '@/components/ui';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { fmtDate, fmtDuration, fmtVolume } from '@/lib/format';
import { workoutVolume } from '@/lib/stats';
import type { Workout } from '@/lib/types';
import { useStore } from '@/store';

type Item = { kind: 'header'; title: string } | { kind: 'workout'; w: Workout };

export default function HistoryTab() {
  const theme = useTheme();
  const history = useStore((s) => s.history);
  const units = useStore((s) => s.settings.units);

  const items = useMemo(() => {
    const out: Item[] = [];
    let last = '';
    for (const w of history) {
      const key = new Date(w.startedAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
      if (key !== last) {
        out.push({ kind: 'header', title: key });
        last = key;
      }
      out.push({ kind: 'workout', w });
    }
    return out;
  }, [history]);

  const [now] = useState(() => Date.now());
  const weekCount = history.filter((w) => w.startedAt > now - 7 * 86400000).length;
  const totalVol = history.reduce((n, w) => n + workoutVolume(w), 0);

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={{ padding: Spacing.three, paddingBottom: 120, gap: Spacing.three }}
      data={items}
      keyExtractor={(it, i) => (it.kind === 'header' ? `h-${it.title}` : it.w.id) + i}
      ListHeaderComponent={
        history.length ? (
          <Row style={{ maxWidth: MaxContentWidth, width: '100%', alignSelf: 'center' }}>
            <Stat label="Workouts" value={String(history.length)} />
            <Stat label="This week" value={String(weekCount)} />
            <Stat label="Total volume" value={fmtVolume(totalVol, units)} />
          </Row>
        ) : undefined
      }
      ListEmptyComponent={
        <Empty
          icon="time-outline"
          title="No workouts yet"
          body="Finished workouts show up here, with every set you logged."
          action={<Button title="Start a workout" onPress={() => router.navigate('/')} />}
        />
      }
      renderItem={({ item }) => (
        <View style={{ maxWidth: MaxContentWidth, width: '100%', alignSelf: 'center' }}>
          {item.kind === 'header' ? (
            <SectionHeader title={item.title} />
          ) : (
            <Card onPress={() => router.push(`/history/${item.w.id}`)}>
              <T variant="subheading">{item.w.name}</T>
              <Row gap={Spacing.three}>
                <Row gap={4}>
                  <Icon name="calendar-outline" size={14} color="textSecondary" />
                  <T variant="caption" color="textSecondary">{fmtDate(item.w.startedAt)}</T>
                </Row>
                {item.w.endedAt && (
                  <Row gap={4}>
                    <Icon name="time-outline" size={14} color="textSecondary" />
                    <T variant="caption" color="textSecondary">{fmtDuration(item.w.endedAt - item.w.startedAt)}</T>
                  </Row>
                )}
                <Row gap={4}>
                  <Icon name="barbell-outline" size={14} color="textSecondary" />
                  <T variant="caption" color="textSecondary">{fmtVolume(workoutVolume(item.w), units)}</T>
                </Row>
              </Row>
              <WorkoutExerciseList workout={item.w} />
            </Card>
          )}
        </View>
      )}
    />
  );
}
