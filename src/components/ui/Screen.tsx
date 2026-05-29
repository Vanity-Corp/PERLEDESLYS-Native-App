import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle, type ScrollViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function Screen({ children, scroll = false, style, contentContainerStyle, ...props }: PropsWithChildren<{ scroll?: boolean; style?: ViewStyle; contentContainerStyle?: ViewStyle } & ScrollViewProps>) {
  const { colors } = useTheme();
  if (scroll) {
    return <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }, style]}><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, contentContainerStyle]} {...props}>{children}</ScrollView></SafeAreaView>;
  }
  return <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }, style]}><View style={[styles.content, contentContainerStyle]}>{children}</View></SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex: 1 }, content: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', padding: Spacing.four, gap: Spacing.four } });
