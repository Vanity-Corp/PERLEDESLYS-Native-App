import type { PropsWithChildren } from 'react';
import { Text as RNText, StyleSheet, type TextProps } from 'react-native';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
export function Text({ children, variant = 'body', muted, style, ...props }: PropsWithChildren<TextProps & { variant?: 'hero' | 'title' | 'subtitle' | 'body' | 'caption' | 'label'; muted?: boolean }>) {
  const { colors } = useTheme();
  return <RNText style={[styles.base, styles[variant], { color: muted ? colors.textSecondary : colors.text }, style]} {...props}>{children}</RNText>;
}
const styles = StyleSheet.create({ base: { fontFamily: Fonts?.sans, includeFontPadding: false }, hero: { fontFamily: Fonts?.serif, fontSize: 42, lineHeight: 48, fontWeight: '500' }, title: { fontFamily: Fonts?.serif, fontSize: 30, lineHeight: 36, fontWeight: '600' }, subtitle: { fontSize: 20, lineHeight: 26, fontWeight: '700' }, body: { fontSize: 16, lineHeight: 23 }, caption: { fontSize: 13, lineHeight: 18 }, label: { fontSize: 12, lineHeight: 16, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' } });
