import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Text } from './Text';
import { Button } from './Button';
export function LoadingState({ label = 'Chargement…' }) { const { colors } = useTheme(); return <View style={styles.center}><ActivityIndicator color={colors.primary} /><Text muted>{label}</Text></View>; }
export function EmptyState({ title, message }: { title: string; message: string }) { return <View style={styles.center}><Text variant="subtitle">{title}</Text><Text muted style={{ textAlign: 'center' }}>{message}</Text></View>; }
export function ErrorState({ title = 'Oups', message, onRetry }: { title?: string; message: string; onRetry?: () => void }) { return <View style={styles.center}><Text variant="subtitle">{title}</Text><Text muted style={{ textAlign: 'center' }}>{message}</Text>{onRetry ? <Button variant="secondary" onPress={onRetry}>Réessayer</Button> : null}</View>; }
const styles = StyleSheet.create({ center: { alignItems: 'center', justifyContent: 'center', gap: Spacing.three, padding: Spacing.six } });
