import { FlatList, RefreshControl } from 'react-native';
import type { ContentItem } from '@/types/domain';
import { ContentCard } from '@/components/cards/ContentCard';
import { EmptyState } from '@/components/ui/StateView';
import { useContentStore } from '@/hooks/use-content-store';
import { useTheme } from '@/hooks/use-theme';
export function ContentList({ data, refreshing, onRefresh, onEndReached }: { data: ContentItem[]; refreshing?: boolean; onRefresh?: () => void; onEndReached?: () => void }) { const { favorites } = useContentStore(); const { colors } = useTheme(); return <FlatList data={data} keyExtractor={(item) => item.id} renderItem={({ item }) => <ContentCard item={item} favorite={favorites.includes(item.id)} />} showsVerticalScrollIndicator={false} onEndReached={onEndReached} onEndReachedThreshold={0.4} refreshControl={<RefreshControl refreshing={Boolean(refreshing)} onRefresh={onRefresh} tintColor={colors.primary} />} ListEmptyComponent={<EmptyState title="Aucun contenu" message="Ajustez votre recherche ou vos filtres." />} />; }
