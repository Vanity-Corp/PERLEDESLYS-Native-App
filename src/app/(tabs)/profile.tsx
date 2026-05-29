import { Link } from 'expo-router';
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/use-auth';
import { authStore } from '@/store/auth.store';
import { Spacing } from '@/constants/theme';
export default function ProfileScreen() { const { user } = useAuth(); return <Screen scroll><Card style={{ alignItems: 'center' }}>{user ? <Image source={{ uri: user.avatarUrl }} style={styles.avatar} /> : null}<Text variant="title">{user?.name}</Text><Text muted>{user?.email}</Text><Text variant="label">Statut {user?.role} · accès privé {user?.hasAccessCode ? 'activé' : 'non activé'}</Text></Card><Card><Text variant="subtitle">Espace profile</Text><Text muted>Modifier profil, avatar, préférences, historique et contenus sauvegardés.</Text><Link href="/(protected)/profile/edit" asChild><Button>Modifier mon profil</Button></Link><Link href="/(protected)/settings" asChild><Button variant="secondary">Paramètres</Button></Link><Button variant="ghost" onPress={() => void authStore.logout()}>Logout</Button></Card><View style={{ height: Spacing.six }} /></Screen>; }
const styles = StyleSheet.create({ avatar: { width: 104, height: 104, borderRadius: 52 } });
