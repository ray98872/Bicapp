import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps, ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type PressableProps,
  type ScrollViewProps,
  type StyleProp,
  type TextInputProps,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { MaxContentWidth, Radius, Spacing, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export function Icon({ name, size = 20, color }: { name: IconName; size?: number; color?: ThemeColor | string }) {
  const theme = useTheme();
  const c = color ? ((theme as Record<string, string>)[color] ?? color) : theme.text;
  return <Ionicons name={name} size={size} color={c} />;
}

type TVariant = 'body' | 'title' | 'heading' | 'subheading' | 'small' | 'caption' | 'label';

export function T({
  variant = 'body',
  color,
  style,
  ...rest
}: TextProps & { variant?: TVariant; color?: ThemeColor }) {
  const theme = useTheme();
  return <Text style={[{ color: theme[color ?? 'text'] }, tStyles[variant], style]} {...rest} />;
}

const tStyles = StyleSheet.create({
  title: { fontSize: 32, lineHeight: 38, fontWeight: '800', letterSpacing: -0.5 },
  heading: { fontSize: 22, lineHeight: 28, fontWeight: '700' },
  subheading: { fontSize: 17, lineHeight: 23, fontWeight: '700' },
  body: { fontSize: 16, lineHeight: 23, fontWeight: '500' },
  small: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '600' },
  label: { fontSize: 12, lineHeight: 16, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
});

export function Screen({
  children,
  contentStyle,
  ...rest
}: ScrollViewProps & { children: ReactNode; contentStyle?: StyleProp<ViewStyle> }) {
  const theme = useTheme();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={styles.screenContent}
      keyboardShouldPersistTaps="handled"
      {...rest}>
      <View style={[styles.screenInner, contentStyle]}>{children}</View>
    </ScrollView>
  );
}

export function Card({
  children,
  style,
  onPress,
  tone = 'backgroundElement',
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  tone?: ThemeColor;
}) {
  const theme = useTheme();
  const base = [styles.card, { backgroundColor: theme[tone], borderColor: theme.border }, style];
  if (!onPress) return <View style={base}>{children}</View>;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [base, pressed && { opacity: 0.75 }]}>
      {children}
    </Pressable>
  );
}

type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';

export function Button({
  title,
  icon,
  variant = 'primary',
  size = 'md',
  style,
  textStyle,
  ...rest
}: PressableProps & {
  title?: string;
  icon?: IconName;
  variant?: BtnVariant;
  size?: 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}) {
  const theme = useTheme();
  const palette: Record<BtnVariant, { bg: string; fg: string }> = {
    primary: { bg: theme.accent, fg: theme.accentText },
    secondary: { bg: theme.backgroundSelected, fg: theme.text },
    ghost: { bg: 'transparent', fg: theme.accent },
    danger: { bg: 'transparent', fg: theme.danger },
    success: { bg: theme.success, fg: theme.accentText },
  };
  const { bg, fg } = palette[variant];
  const pad = size === 'lg' ? 18 : size === 'sm' ? 8 : 13;
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, paddingVertical: pad, opacity: rest.disabled ? 0.4 : pressed ? 0.8 : 1 },
        size === 'sm' && { paddingHorizontal: 12 },
        style,
      ]}
      {...rest}>
      {icon && <Ionicons name={icon} size={size === 'sm' ? 16 : 20} color={fg} />}
      {title && (
        <Text style={[{ color: fg, fontWeight: '700', fontSize: size === 'sm' ? 14 : 16 }, textStyle]}>{title}</Text>
      )}
    </Pressable>
  );
}

export function IconButton({
  name,
  onPress,
  color,
  size = 22,
  label,
}: {
  name: IconName;
  onPress?: () => void;
  color?: ThemeColor;
  size?: number;
  label?: string;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      hitSlop={10}
      onPress={onPress}
      style={({ pressed }) => [styles.iconButton, pressed && { opacity: 0.5 }]}>
      <Icon name={name} size={size} color={color} />
    </Pressable>
  );
}

export function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        { backgroundColor: active ? theme.accent : theme.backgroundElement, borderColor: active ? theme.accent : theme.border },
      ]}>
      <Text style={{ color: active ? theme.accentText : theme.text, fontWeight: '600', fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}

export function Tag({ label, tone = 'backgroundSelected' }: { label: string; tone?: ThemeColor }) {
  const theme = useTheme();
  return (
    <View style={[styles.tag, { backgroundColor: theme[tone] }]}>
      <T variant="caption">{label}</T>
    </View>
  );
}

export function Input({ style, ...rest }: TextInputProps) {
  const theme = useTheme();
  return (
    <TextInput
      placeholderTextColor={theme.textSecondary}
      style={[
        styles.input,
        { backgroundColor: theme.backgroundElement, color: theme.text, borderColor: theme.border },
        style,
      ]}
      {...rest}
    />
  );
}

export function SearchBar(props: TextInputProps) {
  const theme = useTheme();
  return (
    <View style={[styles.search, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      <Icon name="search" size={18} color="textSecondary" />
      <TextInput
        placeholderTextColor={theme.textSecondary}
        style={[styles.searchInput, { color: theme.text }]}
        autoCorrect={false}
        clearButtonMode="while-editing"
        {...props}
      />
    </View>
  );
}

export function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <View style={styles.sectionHeader}>
      <T variant="label" color="textSecondary">
        {title}
      </T>
      {action}
    </View>
  );
}

export function Empty({ icon, title, body, action }: { icon: IconName; title: string; body?: string; action?: ReactNode }) {
  return (
    <View style={styles.empty}>
      <Icon name={icon} size={40} color="textSecondary" />
      <T variant="subheading" style={{ textAlign: 'center' }}>
        {title}
      </T>
      {body && (
        <T color="textSecondary" style={{ textAlign: 'center' }}>
          {body}
        </T>
      )}
      {action}
    </View>
  );
}

export function Row({ children, style, gap = Spacing.two }: { children: ReactNode; style?: StyleProp<ViewStyle>; gap?: number }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap }, style]}>{children}</View>;
}

export function Stat({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.stat, { backgroundColor: theme.backgroundSelected }]}>
      <T variant="caption" color="textSecondary">
        {label}
      </T>
      <T variant="subheading">{value}</T>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContent: { flexGrow: 1, alignItems: 'center', padding: Spacing.three, paddingBottom: Spacing.six },
  screenInner: { width: '100%', maxWidth: MaxContentWidth, gap: Spacing.three },
  card: { borderRadius: Radius.md, padding: Spacing.three, borderWidth: StyleSheet.hairlineWidth, gap: Spacing.two },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
  },
  iconButton: { padding: 4 },
  chip: { borderRadius: Radius.pill, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1 },
  tag: { borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  input: { borderRadius: Radius.sm, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  searchInput: { flex: 1, fontSize: 16, paddingVertical: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.two },
  empty: { alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.five, paddingHorizontal: Spacing.four },
  stat: { flex: 1, borderRadius: Radius.sm, padding: 12, gap: 2 },
});
