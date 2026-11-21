import { BottomTabBar, Tabs } from 'expo-router/js-tabs';

import { ActiveWorkoutBar } from '@/components/active-workout-bar';
import { Icon, type IconName } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';

function tabIcon(name: IconName, active: IconName) {
  function TabIcon({ color, focused }: { color: unknown; focused: boolean }) {
    return <Icon name={focused ? active : name} color={String(color)} size={24} />;
  }
  return TabIcon;
}

export default function TabsLayout() {
  const theme = useTheme();
  return (
    <Tabs
      tabBar={(props) => (
        <>
          <ActiveWorkoutBar />
          <BottomTabBar {...props} />
        </>
      )}
      screenOptions={{
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: { backgroundColor: theme.backgroundElement, borderTopColor: theme.border },
        headerStyle: { backgroundColor: theme.background },
        headerShadowVisible: false,
        headerTintColor: theme.text,
        headerTitleStyle: { fontWeight: '800', fontSize: 20 },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Workout', tabBarIcon: tabIcon('add-circle-outline', 'add-circle') }} />
      <Tabs.Screen name="history" options={{ title: 'History', tabBarIcon: tabIcon('time-outline', 'time') }} />
      <Tabs.Screen name="exercises" options={{ title: 'Exercises', tabBarIcon: tabIcon('barbell-outline', 'barbell') }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: tabIcon('settings-outline', 'settings') }} />
    </Tabs>
  );
}
