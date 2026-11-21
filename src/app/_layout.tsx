import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useSyncExternalStore } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStore } from '@/store';

export default function RootLayout() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const hydrated = useSyncExternalStore(
    (cb) => useStore.persist.onFinishHydration(cb),
    () => useStore.persist.hasHydrated(),
    () => true
  );

  const navTheme = scheme === 'dark' ? DarkTheme : DefaultTheme;

  if (!hydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <ThemeProvider
      value={{
        ...navTheme,
        colors: { ...navTheme.colors, primary: colors.accent, background: colors.background, card: colors.background },
      }}>
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '700' },
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: { backgroundColor: colors.background },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="workout" options={{ title: 'Workout', presentation: 'fullScreenModal' }} />
        <Stack.Screen name="picker" options={{ title: 'Add exercises', presentation: 'modal' }} />
        <Stack.Screen name="exercise/[id]" options={{ title: 'Exercise' }} />
        <Stack.Screen name="exercise/new" options={{ title: 'Custom exercise', presentation: 'modal' }} />
        <Stack.Screen name="template/[id]" options={{ title: 'Template' }} />
        <Stack.Screen name="template/edit" options={{ title: 'Edit template', presentation: 'modal' }} />
        <Stack.Screen name="history/[id]" options={{ title: 'Workout' }} />
        <Stack.Screen name="summary/[id]" options={{ title: 'Workout complete', presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
