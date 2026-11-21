import { router, useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';

import { ExerciseBrowser } from '@/components/exercise-browser';
import { Button } from '@/components/ui';

export default function ExercisesTab() {
  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button title="Custom" icon="add" variant="ghost" size="sm" onPress={() => router.push('/exercise/new')} />
      ),
    });
  }, [navigation]);

  return <ExerciseBrowser onSelect={(e) => router.push(`/exercise/${e.id}`)} />;
}
