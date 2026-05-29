import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { Category, ContentItem } from '@/types/domain';
import { contentService } from '@/services/content.service';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ContentList } from '@/components/lists/ContentList';
import { ErrorState, LoadingState } from '@/components/ui/StateView';
import { Spacing } from '@/constants/theme';
import { getErrorMessage } from '@/utils/api-error';

export default function ContentScreen() { const [items, setItems] = useState<ContentItem[]>([]); const [categories, setCategories] = useState<Category[]>([]); const [categoryId, setCategoryId] = useState<string>(); const [query, setQuery] = useState(''); const [page, setPage] = useState(1); const [hasNext, setHasNext] = useState(false); const [loading, setLoading] = useState(true); const [refreshing, setRefreshing] = useState(false); const [error, setError] = useState('');
  const load = useCallback(async (nextPage = 1, append = false) => { setError(''); if (!append) setLoading(true); try { const [cats, response] = await Promise.all([contentService.getCategories(), contentService.getContent({ page: nextPage, categoryId, query })]); setCategories(cats); setItems((current) => append ? [...current, ...response.items] : response.items); setPage(response.page); setHasNext(response.hasNextPage); } catch (err) { setError(getErrorMessage(err)); } finally { setLoading(false); setRefreshing(false); } }, [categoryId, query]);
  useEffect(() => { void load(1); }, [load]);
  if (loading && items.length === 0) return <Screen><LoadingState /></Screen>;
  if (error && items.length === 0) return <Screen><ErrorState message={error} onRetry={() => load(1)} /></Screen>;
  return <Screen><View style={styles.header}><Text variant="title">Contenus exclusifs</Text><Text muted>Recherche, filtres, pagination et pull-to-refresh sur backend mocké.</Text><Input label="Recherche" value={query} onChangeText={setQuery} placeholder="Massage, routine, guide…" /></View><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}><Button variant={!categoryId ? 'primary' : 'secondary'} onPress={() => setCategoryId(undefined)}>Tout</Button>{categories.map((cat) => <Button key={cat.id} variant={categoryId === cat.id ? 'primary' : 'secondary'} onPress={() => setCategoryId(cat.id)}>{cat.icon} {cat.name}</Button>)}</ScrollView><ContentList data={items} refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(1); }} onEndReached={() => { if (hasNext) void load(page + 1, true); }} />{error ? <Text style={{ color: '#B94242' }}>{error}</Text> : null}</Screen>;
}
const styles = StyleSheet.create({ header: { gap: Spacing.three }, filters: { gap: Spacing.two, paddingBottom: Spacing.three } });
