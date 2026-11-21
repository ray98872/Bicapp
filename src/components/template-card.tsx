import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import type { Template } from '@/lib/types';
import { fmtRelativeDay } from '@/lib/format';
import { findExercise, useStore } from '@/store';

import { Card, Icon, Row, T } from './ui';

export function TemplateCard({ template }: { template: Template }) {
  const custom = useStore((s) => s.customExercises);
  const lastDone = useStore((s) => s.history.find((w) => w.templateId === template.id)?.startedAt);
  const names = template.exercises.map((e) => {
    const ex = findExercise(e.exerciseId, custom);
    return `${e.sets.filter((s) => s.type !== 'warmup').length} × ${ex?.name ?? 'Unknown exercise'}`;
  });

  return (
    <Card style={styles.card} onPress={() => router.push(`/template/${template.id}`)}>
      <Row style={{ justifyContent: 'space-between' }}>
        <T variant="subheading" numberOfLines={1} style={{ flex: 1 }}>
          {template.name}
        </T>
        <Icon name="chevron-forward" size={18} color="textSecondary" />
      </Row>
      <View style={{ gap: 2 }}>
        {names.slice(0, 4).map((n, i) => (
          <T key={i} variant="small" color="textSecondary" numberOfLines={1}>
            {n}
          </T>
        ))}
        {names.length > 4 && (
          <T variant="small" color="textSecondary">
            + {names.length - 4} more
          </T>
        )}
        {names.length === 0 && (
          <T variant="small" color="textSecondary">
            No exercises yet
          </T>
        )}
      </View>
      {lastDone && (
        <Row gap={4}>
          <Icon name="time-outline" size={14} color="textSecondary" />
          <T variant="caption" color="textSecondary">
            {fmtRelativeDay(lastDone)}
          </T>
        </Row>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flexGrow: 1, flexBasis: 280 },
});
