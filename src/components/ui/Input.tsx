import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Text } from './Text';
export function Input({ label, error, style, ...props }: TextInputProps & { label: string; error?: string }) { const { colors } = useTheme(); return <View style={styles.wrap}><Text variant="label">{label}</Text><TextInput placeholderTextColor={colors.textSecondary} style={[styles.input, { borderColor: error ? colors.destructive : colors.border, backgroundColor: colors.card, color: colors.text }, style]} {...props} />{error ? <Text variant="caption" style={{ color: colors.destructive }}>{error}</Text> : null}</View>; }
const styles = StyleSheet.create({ wrap: { gap: Spacing.two }, input: { minHeight: 52, borderWidth: 1, borderRadius: Radius.lg, paddingHorizontal: Spacing.four, fontSize: 16 } });
