import Constants from 'expo-constants';
import { Switch, View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/hooks/use-theme';
import { uiStore } from '@/store/ui.store';
import { contentStore } from '@/store/content.store';
import { useContentStore } from '@/hooks/use-content-store';
export default function SettingsScreen() { const { theme } = useTheme(); const { offlineMode } = useContentStore(); return <Screen scroll><Text variant="title">Paramètres</Text><Card><Text variant="subtitle">Apparence</Text><View style={{ flexDirection: 'row', gap: 8 }}><Button variant={theme === 'system' ? 'primary' : 'secondary'} onPress={() => uiStore.setTheme('system')}>Système</Button><Button variant={theme === 'light' ? 'primary' : 'secondary'} onPress={() => uiStore.setTheme('light')}>Clair</Button><Button variant={theme === 'dark' ? 'primary' : 'secondary'} onPress={() => uiStore.setTheme('dark')}>Sombre</Button></View></Card><Card><Text variant="subtitle">Notifications & offline</Text><Text muted>Expo Notifications prêt à brancher : permissions et token seront connectés ici.</Text><View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text>Simuler hors ligne</Text><Switch value={offlineMode} onValueChange={contentStore.setOfflineMode} /></View></Card><Card><Text variant="subtitle">Légal</Text><Text muted>Privacy policy · Terms of service</Text><Text muted>Version {Constants.expoConfig?.version ?? '1.0.0'}</Text></Card></Screen>; }
