import { StyleSheet, View } from 'react-native';
import { Radius, Spacing } from '@/constants/theme';
import { useContentStore } from '@/hooks/use-content-store';
import { useTheme } from '@/hooks/use-theme';
import { Text } from '@/components/ui/Text';
export function OfflineBanner() { const { offlineMode } = useContentStore(); const { colors } = useTheme(); if (!offlineMode) return null; return <View style={[styles.banner, { backgroundColor: colors.backgroundElement }]}><Text variant="caption">Mode hors ligne simulé : les contenus en cache restent disponibles.</Text></View>; }
const styles = StyleSheet.create({ banner: { padding: Spacing.three, borderRadius: Radius.lg } });
