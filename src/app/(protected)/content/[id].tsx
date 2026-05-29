import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Share, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import type { ContentItem } from '@/types/domain';
import { contentService } from '@/services/content.service';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingState, ErrorState } from '@/components/ui/StateView';
import { useAuth } from '@/hooks/use-auth';
import { useContentStore } from '@/hooks/use-content-store';
import { contentStore } from '@/store/content.store';
import { Spacing } from '@/constants/theme';
import { getErrorMessage } from '@/utils/api-error';

export default function ContentDetailScreen() { const { id } = useLocalSearchParams<{ id: string }>(); const { user } = useAuth(); const { favorites } = useContentStore(); const [item, setItem] = useState<ContentItem>(); const [related, setRelated] = useState<ContentItem[]>([]); const [error, setError] = useState(''); useEffect(() => { if (!id) return; contentService.getById(id).then((content) => { setItem(content); contentStore.trackViewed(content.id); return contentService.getRelated(content); }).then(setRelated).catch((err) => setError(getErrorMessage(err))); }, [id]); if (error) return <Screen><ErrorState message={error} /></Screen>; if (!item) return <Screen><LoadingState /></Screen>; const locked = item.isPremium && user?.role !== 'premium'; return <Screen scroll contentContainerStyle={{ padding: 0 }}><Image source={{ uri: item.imageUrl }} style={styles.hero} contentFit="cover" /><View style={styles.content}><Text variant="label" style={{ color: '#C9A24A' }}>{item.type} · {item.durationMinutes} min</Text><Text variant="hero">{item.title}</Text><Text muted>{item.subtitle}</Text>{locked ? <Card><Text variant="title">Contenu verrouillé</Text><Text muted>Ce contenu est réservé aux membres validés avec code d’accès unique.</Text><Button>Activer mon accès premium</Button></Card> : <Card><Text>{item.body}</Text><Button variant="secondary" onPress={() => contentStore.toggleFavorite(item.id)}>{favorites.includes(item.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}</Button><Button variant="ghost" onPress={() => Share.share({ title: item.title, message: item.description })}>Partager</Button></Card>}<Text variant="subtitle">Contenus liés</Text>{related.map((content) => <Card key={content.id}><Text variant="subtitle">{content.title}</Text><Text muted>{content.description}</Text></Card>)}</View></Screen>; }
const styles = StyleSheet.create({ hero: { height: 360, width: '100%' }, content: { padding: Spacing.four, gap: Spacing.four } });
