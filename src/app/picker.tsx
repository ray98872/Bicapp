import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ExerciseBrowser } from '@/components/exercise-browser';
import { Button } from '@/components/ui';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { consumePick, isPickMulti } from '@/lib/ui';

export default function ExercisePicker() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<string[]>([]);
  const multi = isPickMulti();

  function done(ids: string[]) {
    consumePick(ids);
    router.back();
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Stack.Screen
        options={{
          title: multi ? 'Add exercises' : 'Replace exercise',
          headerLeft: () => <Button title="Cancel" variant="ghost" size="sm" onPress={() => router.back()} />,
          headerRight: () => (
            <Button title="New" icon="add" variant="ghost" size="sm" onPress={() => router.push('/exercise/new')} />
          ),
        }}
      />
      <ExerciseBrowser
        selectedIds={selected}
        onSelect={(e) => {
          if (!multi) return done([e.id]);
          setSelected((s) => (s.includes(e.id) ? s.filter((x) => x !== e.id) : [...s, e.id]));
        }}
      />
      {multi && selected.length > 0 && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.three, backgroundColor: theme.background, borderTopColor: theme.border }]}>
          <Button
            style={styles.btn}
            size="lg"
            icon="add"
            title={`Add ${selected.length} exercise${selected.length === 1 ? '' : 's'}`}
            onPress={() => done(selected)}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  btn: { width: '100%', maxWidth: MaxContentWidth },
});
