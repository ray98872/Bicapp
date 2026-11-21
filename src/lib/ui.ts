import * as Haptics from 'expo-haptics';
import { Alert, Platform } from 'react-native';

import { useStore } from '@/store';

/** Cross-platform confirm dialog (Alert on native, window.confirm on web). */
export function confirm(title: string, message: string, confirmText = 'OK', destructive = false) {
  return new Promise<boolean>((resolve) => {
    if (Platform.OS === 'web') {
      resolve(window.confirm(`${title}\n\n${message}`));
      return;
    }
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      { text: confirmText, style: destructive ? 'destructive' : 'default', onPress: () => resolve(true) },
    ]);
  });
}

export function notify(title: string, message?: string) {
  if (Platform.OS === 'web') window.alert(message ? `${title}\n\n${message}` : title);
  else Alert.alert(title, message);
}

export function haptic(kind: 'light' | 'success' | 'warning' = 'light') {
  if (Platform.OS === 'web' || !useStore.getState().settings.haptics) return;
  if (kind === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  else
    Haptics.notificationAsync(
      kind === 'success' ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning
    ).catch(() => {});
}

/* Exercise picker bridge: a screen registers a callback, the picker modal calls it. */
type PickHandler = (ids: string[]) => void;
let pickHandler: PickHandler | null = null;
let pickMulti = true;

export function setPickHandler(fn: PickHandler, multi = true) {
  pickHandler = fn;
  pickMulti = multi;
}
export function consumePick(ids: string[]) {
  pickHandler?.(ids);
  pickHandler = null;
}
export function isPickMulti() {
  return pickMulti;
}
