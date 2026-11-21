import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { parseNum } from '@/lib/format';
import type { SetType } from '@/lib/types';

const ORDER: SetType[] = ['normal', 'warmup', 'drop', 'failure'];

export function nextSetType(t: SetType): SetType {
  return ORDER[(ORDER.indexOf(t) + 1) % ORDER.length];
}

export const SET_TYPE_LABEL: Record<SetType, string> = {
  normal: 'Working set',
  warmup: 'Warm-up',
  drop: 'Drop set',
  failure: 'To failure',
};

/** Shows the set number, or W / D / F for special sets. Tap to cycle (handled by parent). */
export function SetTypeBadge({ type, index, done }: { type: SetType; index: number; done?: boolean }) {
  const theme = useTheme();
  const label = type === 'warmup' ? 'W' : type === 'drop' ? 'D' : type === 'failure' ? 'F' : String(index);
  const color =
    type === 'warmup' ? theme.warmup : type === 'drop' ? '#7E6BD6' : type === 'failure' ? theme.danger : theme.text;
  return (
    <View style={[styles.badge, { backgroundColor: done ? 'transparent' : theme.backgroundSelected }]}>
      <Text style={{ color, fontWeight: '800', fontSize: 15 }}>{label}</Text>
    </View>
  );
}

/** Numeric input that keeps its own text while typing and reports parsed numbers. */
export function NumberCell({
  value,
  onChange,
  placeholder,
  decimal,
  highlight,
}: {
  value?: number;
  onChange: (v?: number) => void;
  placeholder?: string;
  decimal?: boolean;
  highlight?: boolean;
}) {
  const theme = useTheme();
  const [text, setText] = useState(value === undefined ? '' : String(value));
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) setText(value === undefined ? '' : String(value));
  }, [value]);

  return (
    <TextInput
      value={text}
      placeholder={placeholder}
      placeholderTextColor={theme.textSecondary}
      keyboardType={decimal ? 'decimal-pad' : 'number-pad'}
      selectTextOnFocus
      onFocus={() => (focused.current = true)}
      onBlur={() => {
        focused.current = false;
        setText(value === undefined ? '' : String(value));
      }}
      onChangeText={(t) => {
        setText(t);
        onChange(parseNum(t));
      }}
      style={[
        styles.cell,
        {
          color: theme.text,
          backgroundColor: highlight ? 'transparent' : theme.backgroundSelected,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  badge: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cell: {
    width: '100%',
    minWidth: 56,
    height: 40,
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    paddingHorizontal: 6,
  },
});
