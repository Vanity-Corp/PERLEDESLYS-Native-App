import { Tabs } from 'expo-router';
import { Text as RNText } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
export default function TabsLayout() { const { isAuthenticated } = useAuth(); const { colors } = useTheme(); if (!isAuthenticated) return <Redirect href="/(auth)/login" />; return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.textSecondary, tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border } }}><Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color }) => <Icon label="⌂" color={String(color)} /> }} /><Tabs.Screen name="content" options={{ title: 'Content', tabBarIcon: ({ color }) => <Icon label="◇" color={String(color)} /> }} /><Tabs.Screen name="favorites" options={{ title: 'Favorites', tabBarIcon: ({ color }) => <Icon label="♡" color={String(color)} /> }} /><Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color }) => <Icon label="◌" color={String(color)} /> }} /></Tabs>; }
function Icon({ label, color }: { label: string; color: string }) { return <RNText style={{ color, fontSize: 20 }}>{label}</RNText>; }
