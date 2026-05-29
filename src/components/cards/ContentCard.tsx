import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import type { ContentItem } from '@/types/domain';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { contentStore } from '@/store/content.store';
import { formatShortDate } from '@/utils/date';

export function ContentCard({ item, favorite }: { item: ContentItem; favorite: boolean }) {
  const { colors } = useTheme();
  return <Link href={{ pathname: '/(protected)/content/[id]', params: { id: item.id } }} asChild><Pressable style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}><Image source={{ uri: item.imageUrl }} style={styles.image} contentFit="cover" transition={250} /><View style={styles.body}><View style={styles.row}><Text variant="label" style={{ color: colors.accent }}>{item.type} · {formatShortDate(item.publishedAt)}</Text>{item.isPremium ? <Text variant="label" style={{ color: colors.primary }}>Premium</Text> : null}</View><Text variant="subtitle">{item.title}</Text><Text muted numberOfLines={2}>{item.description}</Text><View style={styles.row}><Text variant="caption" muted>{item.durationMinutes} min · ★ {item.rating}</Text><Button variant="ghost" onPress={(event) => { event.preventDefault(); contentStore.toggleFavorite(item.id); }}>{favorite ? '♥' : '♡'}</Button></View></View></Pressable></Link>;
}
const styles = StyleSheet.create({ card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.xl, overflow: 'hidden', marginBottom: Spacing.four }, image: { height: 190, width: '100%' }, body: { padding: Spacing.four, gap: Spacing.two }, row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.three } });
