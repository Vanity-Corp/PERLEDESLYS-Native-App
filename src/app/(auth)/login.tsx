import { Link } from 'expo-router';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { LoginForm } from '@/components/forms/LoginForm';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { Spacing } from '@/constants/theme';

export default function LoginScreen() {
  return <Screen scroll contentContainerStyle={styles.content}><ImageBackground source={{ uri: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&h=800&fit=crop' }} style={styles.hero} imageStyle={styles.heroImage}><View style={styles.overlay}><Text variant="hero" style={{ color: '#fff' }}>PERLEDESLYS</Text><Text style={{ color: '#fff', textAlign: 'center' }}>Votre espace beauté privé, rose poudré et doré.</Text></View></ImageBackground><Card><Text variant="title">Connexion</Text><Text muted>Backend mocké : premium@perledelys.app / password ou code LYS-PRIVE-2026.</Text><LoginForm /><Link href="/(auth)/forgot-password" asChild><Text variant="label" style={{ textAlign: 'center' }}>Mot de passe oublié ?</Text></Link></Card></Screen>;
}
const styles = StyleSheet.create({ content: { gap: Spacing.five }, hero: { height: 280, borderRadius: 32, overflow: 'hidden', justifyContent: 'flex-end' }, heroImage: { borderRadius: 32 }, overlay: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', gap: Spacing.three, padding: Spacing.six, backgroundColor: 'rgba(46,37,40,0.35)' } });
