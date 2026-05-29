import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Link } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { ContentItem } from '@/types/domain';
import { contentService } from '@/services/content.service';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/StateView';
import { ContentCard } from '@/components/cards/ContentCard';
import { OfflineBanner } from '@/components/shared/OfflineBanner';
import { useAuth } from '@/hooks/use-auth';
import { useContentStore } from '@/hooks/use-content-store';
import { Spacing } from '@/constants/theme';

export default function HomeScreen() { const { user } = useAuth(); const { favorites } = useContentStore(); const [featured, setFeatured] = useState<ContentItem[]>([]); const [loading, setLoading] = useState(true); useEffect(() => { contentService.getFeatured().then(setFeatured).finally(() => setLoading(false)); }, []); return <Screen scroll><OfflineBanner /><Animated.View entering={FadeInDown} style={styles.hero}><Text variant="label" style={{ color: '#C9A24A' }}>Bonjour {user?.name}</Text><Text variant="hero" style={{ color: '#fff' }}>Votre rituel beauté privé</Text><Text style={{ color: '#fff' }}>Découvrez les recommandations exclusives et les dernières publications PERLEDESLYS.</Text><Link href="/(tabs)/content" asChild><Button>Explorer</Button></Link></Animated.View><View style={styles.row}><Text variant="title">Sélection éditoriale</Text><Link href="/(tabs)/content" asChild><Text variant="label">Tout voir</Text></Link></View>{loading ? <LoadingState /> : <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.four }}>{featured.map((item) => <View key={item.id} style={{ width: 310 }}><ContentCard item={item} favorite={favorites.includes(item.id)} /></View>)}</ScrollView>}</Screen>; }
const styles = StyleSheet.create({ hero: { minHeight: 250, borderRadius: 32, padding: Spacing.six, justifyContent: 'flex-end', gap: Spacing.three, backgroundColor: '#A85D6F' }, row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' } });
