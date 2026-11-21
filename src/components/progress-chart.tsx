import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

import { Row, T } from './ui';

/** Lightweight bar chart (no native deps) for per-exercise trends. */
export function ProgressChart({
  points,
  format,
  height = 140,
}: {
  points: { date: number; value: number }[];
  format: (v: number) => string;
  height?: number;
}) {
  const theme = useTheme();
  const data = points.slice(-20);
  const max = Math.max(...data.map((p) => p.value), 1);
  const min = Math.min(...data.map((p) => p.value));
  const floor = Math.max(0, min - (max - min) * 0.5);
  const last = data[data.length - 1];
  const first = data[0];
  const change = last && first ? last.value - first.value : 0;

  return (
    <View style={{ gap: 8 }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <T variant="heading">{last ? format(last.value) : '—'}</T>
        {data.length > 1 && (
          <T variant="small" style={{ color: change >= 0 ? theme.success : theme.danger }}>
            {change >= 0 ? '▲' : '▼'} {format(Math.abs(change))} over {data.length} sessions
          </T>
        )}
      </Row>
      <View style={[styles.chart, { height }]}>
        {data.map((p, i) => {
          const h = Math.max(4, ((p.value - floor) / (max - floor || 1)) * height);
          return (
            <View
              key={i}
              style={[
                styles.bar,
                { height: h, backgroundColor: i === data.length - 1 ? theme.accent : theme.accentSoft },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  bar: { flex: 1, borderRadius: 4, maxWidth: 28 },
});
