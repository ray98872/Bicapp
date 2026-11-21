import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * Default to light during static rendering and use the browser preference once hydrated.
 */
export function useColorScheme() {
  const colorScheme = useRNColorScheme();
  return colorScheme ?? 'light';
}
