import { useEffect, useState } from 'react';
import type { ContentItem } from '@/types/domain';
import { contentService } from '@/services/content.service';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { ContentList } from '@/components/lists/ContentList';
import { EmptyState } from '@/components/ui/StateView';
import { useContentStore } from '@/hooks/use-content-store';
export default function FavoritesScreen() { const { favorites } = useContentStore(); const [items, setItems] = useState<ContentItem[]>([]); useEffect(() => { Promise.all(favorites.map((id) => contentService.getById(id))).then(setItems).catch(() => setItems([])); }, [favorites]); return <Screen><Text variant="title">Favoris</Text>{items.length ? <ContentList data={items} /> : <EmptyState title="Aucun favori" message="Ajoutez des contenus à votre sélection privée." />}</Screen>; }
