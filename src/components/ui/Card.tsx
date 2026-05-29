import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
export function Card({ children, style, ...props }: PropsWithChildren<ViewProps>) { const { colors } = useTheme(); return <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, style]} {...props}>{children}</View>; }
const styles = StyleSheet.create({ card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.xl, padding: Spacing.four, gap: Spacing.three, shadowColor: '#6D3342', shadowOpacity: 0.08, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 3 } });
