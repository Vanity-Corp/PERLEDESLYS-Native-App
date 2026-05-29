import type { PropsWithChildren } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, type PressableProps } from 'react-native';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Text } from './Text';
export function Button({ children, variant = 'primary', loading, style, disabled, ...props }: PropsWithChildren<Omit<PressableProps, 'style'> & { variant?: 'primary' | 'secondary' | 'ghost'; loading?: boolean; style?: import('react-native').StyleProp<import('react-native').ViewStyle> }>) {
  const { colors } = useTheme();
  const bg = variant === 'primary' ? colors.primary : variant === 'secondary' ? colors.backgroundElement : 'transparent';
  const fg = variant === 'primary' ? colors.primaryForeground : colors.text;
  return <Pressable accessibilityRole="button" disabled={disabled || loading} style={({ pressed }) => [styles.button, { backgroundColor: bg, opacity: disabled ? 0.5 : pressed ? 0.82 : 1 }, style]} {...props}>{loading ? <ActivityIndicator color={fg} /> : <Text variant="label" style={{ color: fg }}>{children}</Text>}</Pressable>;
}
const styles = StyleSheet.create({ button: { minHeight: 52, paddingHorizontal: Spacing.five, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: Spacing.two } });
