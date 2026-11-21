import { router } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { TemplateCard } from '@/components/template-card';
import { Button, Card, Empty, Row, Screen, SectionHeader, T } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { fmtClock } from '@/lib/format';
import { beginWorkout } from '@/lib/start';
import { useNow } from '@/hooks/use-now';
import { useAllTemplates, useStore } from '@/store';

export default function WorkoutHome() {
  const { mine, builtin } = useAllTemplates();
  const active = useStore((s) => s.active);
  const historyCount = useStore((s) => s.history.length);
  const now = useNow(!!active);

  const folders = useMemo(() => {
    const map = new Map<string, typeof builtin>();
    builtin.forEach((t) => {
      const f = t.folder ?? 'Other';
      map.set(f, [...(map.get(f) ?? []), t]);
    });
    return [...map.entries()];
  }, [builtin]);

  return (
    <Screen>
      {active ? (
        <Card tone="accentSoft">
          <T variant="label" color="accent">
            In progress · {fmtClock((now - active.startedAt) / 1000)}
          </T>
          <T variant="heading">{active.name}</T>
          <Button title="Resume workout" icon="play" onPress={() => router.push('/workout')} />
        </Card>
      ) : (
        <View style={{ gap: Spacing.two }}>
          <T variant="title">Let&apos;s train</T>
          <T color="textSecondary">
            {historyCount === 0
              ? 'Pick a template below, or start empty and add exercises as you go.'
              : `${historyCount} workout${historyCount === 1 ? '' : 's'} logged. Keep showing up.`}
          </T>
        </View>
      )}

      <SectionHeader title="Quick start" />
      <Button title="Start an empty workout" icon="add" size="lg" variant={active ? 'secondary' : 'primary'} onPress={() => beginWorkout()} />

      <SectionHeader
        title={`My templates (${mine.length})`}
        action={<Button title="Template" icon="add" size="sm" variant="ghost" onPress={() => router.push('/template/edit')} />}
      />
      {mine.length === 0 ? (
        <Card>
          <Empty
            icon="albums-outline"
            title="No templates yet"
            body="Create as many as you like — or copy one of the programmes below and make it yours."
            action={<Button title="Create template" icon="add" onPress={() => router.push('/template/edit')} />}
          />
        </Card>
      ) : (
        <View style={styles.grid}>
          {mine.map((t) => (
            <TemplateCard key={t.id} template={t} />
          ))}
        </View>
      )}

      {folders.map(([folder, list]) => (
        <View key={folder} style={{ gap: Spacing.three }}>
          <SectionHeader title={`Programmes · ${folder}`} />
          <View style={styles.grid}>
            {list.map((t) => (
              <TemplateCard key={t.id} template={t} />
            ))}
          </View>
        </View>
      ))}

      <Row style={{ justifyContent: 'center', marginTop: Spacing.three }}>
        <T variant="caption" color="textSecondary">
          Bicapp is free & open source. No accounts, no paywalls.
        </T>
      </Row>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three },
});
